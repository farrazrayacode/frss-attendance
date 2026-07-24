from dotenv import load_dotenv
load_dotenv()

from app.services.firebase_service import firebase_service

if not firebase_service.is_ready:
    print("Firebase belum konek! Cek .env kamu dulu.")
    exit(1)

# --- monitoring_feeds ---
firebase_service.get_ref("monitoring_feeds/1").set({
    "name": "Camera Lobby",
    "is_online": True,
    "stream_url": "rtsp://192.168.1.100/stream",
    "location": "Lobby",
    "ip_address": "192.168.1.100",
    "last_updated": "2026-07-23T10:00:00Z"
})
print("monitoring_feeds/1 tersimpan")

# --- alerts ---
firebase_service.get_ref("alerts/1").set({
    "title": "Unidentified Person Detected",
    "timestamp": "2026-07-23T10:00:00Z",
    "location": "Lobby",
    "type": "motion",
    "is_resolved": False
})
print("alerts/1 tersimpan")

# --- attendance_logs ---
firebase_service.get_ref("attendance_logs/1").set({
    "user_id": 1,
    "device_id": 1,
    "check_type": "check-in",
    "confidence": 0.92,
    "timestamp": "2026-07-23T08:00:00Z"
})
print("attendance_logs/1 tersimpan")

print("\nSemua data awal berhasil ditulis ke Firebase!")