import os
from datetime import datetime
from app.services.firebase_service import firebase_service

def run_test():
    print("🔄 Memeriksa status inisialisasi Firebase be2...")
    if not firebase_service.is_ready:
        print("❌ Firebase service belum siap. Periksa file kredensial JSON atau .env")
        return

    ref = firebase_service.get_ref("system_health/ai_service_test")
    test_payload = {
        "status": "ONLINE",
        "timestamp": datetime.now().isoformat(),
        "service": "frss-ai-be2"
    }
    
    ref.set(test_payload)
    print("✅ Berhasil mengirim status ke Firebase Realtime Database!")
    
    data = ref.get()
    print("📥 Data yang diterima kembali:", data)

if __name__ == "__main__":
    run_test()