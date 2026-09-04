"""
Firebase Service
Handles connection to Firebase Realtime Database for chicken counting data.
"""
import os
import json
import base64
import logging
from typing import Optional
import firebase_admin
from firebase_admin import credentials, db

logger = logging.getLogger(__name__)

_DATABASE_URL = os.getenv("FIREBASE_DATABASE_URL")
if not _DATABASE_URL:
    try:
        import json
        with open("firebase-credentials.json", "r") as f:
            _pid = json.load(f).get("project_id")
            _DATABASE_URL = f"https://{_pid}-default-rtdb.asia-southeast1.firebasedatabase.app"
    except Exception:
        _DATABASE_URL = "https://rfid-de0fd-default-rtdb.asia-southeast1.firebasedatabase.app"


def _load_credentials() -> Optional[credentials.Certificate]:
    """
    Load Firebase credentials from:
    1. FIREBASE_SERVICE_ACCOUNT_BASE64 env var
    2. FIREBASE_SERVICE_ACCOUNT_PATH env var
    3. Default JSON file candidates in local directories
    """
    # 1. Base64
    b64 = os.getenv("FIREBASE_SERVICE_ACCOUNT_BASE64")
    if b64:
        try:
            sa_dict = json.loads(base64.b64decode(b64).decode("utf-8"))
            return credentials.Certificate(sa_dict)
        except Exception as e:
            logger.error(f"Failed to decode FIREBASE_SERVICE_ACCOUNT_BASE64: {e}")

    # 2. Env variable path
    env_path = os.getenv("FIREBASE_SERVICE_ACCOUNT_PATH") or os.getenv("FIREBASE_CREDENTIALS_PATH")
    if env_path and os.path.exists(env_path):
        try:
            return credentials.Certificate(env_path)
        except Exception as e:
            logger.error(f"Failed to load credentials from {env_path}: {e}")

    # 3. Default local file candidates
    candidates = [
        "firebase-credentials.json",
        "serviceAccountKey.json",
        os.path.join(os.path.dirname(__file__), "../../../firebase-credentials.json"),
        os.path.join(os.path.dirname(__file__), "../../../serviceAccountKey.json"),
    ]

    for path in candidates:
        if os.path.exists(path):
            try:
                logger.info(f"Firebase credentials loaded from: {path}")
                return credentials.Certificate(path)
            except Exception as e:
                logger.error(f"Failed to load credentials from candidate {path}: {e}")

    return None

class FirebaseService:
    """Singleton Firebase connection manager"""

    _initialized: bool = False

    def __init__(self):
        self._initialize()

    def _initialize(self):
        if FirebaseService._initialized:
            return

        if not _DATABASE_URL:
            logger.warning("FIREBASE_DATABASE_URL is not set.")
            return

        cred = _load_credentials()
        if not cred:
            return

        try:
            firebase_admin.initialize_app(cred, {"databaseURL": _DATABASE_URL})
            FirebaseService._initialized = True
            logger.info("Firebase initialized successfully.")
        except Exception as e:
            logger.error(f"Failed to initialize Firebase: {e}")

    @property
    def is_ready(self) -> bool:
        return FirebaseService._initialized

    def get_ref(self, path: str):
        if not self.is_ready:
            raise RuntimeError("Firebase is not initialized.")
        return db.reference(path)

    def get_chicken_history(self, date: Optional[str] = None) -> dict:
        path = "chicken_counter/history"
        if date:
            path = f"{path}/{date}"
        ref = self.get_ref(path)
        data = ref.get()
        return data or {}

    def update_session_status(self, date: str, session_id: str, new_status: str) -> bool:
        try:
            ref = self.get_ref(f"chicken_counter/history/{date}/{session_id}/status")
            ref.set(new_status)
            return True
        except Exception as e:
            logger.error(f"Error updating session {session_id} status: {e}")
            return False

    def get_latest_session(self, date: str) -> Optional[dict]:
        history = self.get_chicken_history(date)
        if not history:
            return None

        latest = None
        latest_time = ""
        for session_id, session_data in history.items():
            start_time = session_data.get("start_time", "")
            if start_time > latest_time:
                latest_time = start_time
                latest = {"session_id": session_id, **session_data}

        return latest


# Singleton instance
firebase_service = FirebaseService()
