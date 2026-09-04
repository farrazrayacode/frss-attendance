import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getDatabase } from 'firebase-admin/database';
import * as dotenv from 'dotenv';
import * as path from 'path';
import * as fs from 'fs';

dotenv.config();

async function testFirebase() {
    try {
        console.log('🔄 Menghubungkan ke Firebase...');

        // 1. Tentukan path file kredensial JSON
        const keyPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH
            ? path.resolve(
                  process.cwd(),
                  process.env.FIREBASE_SERVICE_ACCOUNT_PATH,
              )
            : path.resolve(process.cwd(), 'serviceAccountKey.json');

        if (!fs.existsSync(keyPath)) {
            throw new Error(`File kredensial tidak ditemukan di: ${keyPath}`);
        }

        const serviceAccount = JSON.parse(fs.readFileSync(keyPath, 'utf8'));

        // 2. Inisialisasi app jika belum diinisialisasi
        const app =
            getApps().length === 0
                ? initializeApp({
                      credential: cert(serviceAccount),
                      databaseURL: process.env.FIREBASE_DATABASE_URL,
                  })
                : getApps()[0];

        const db = getDatabase(app);
        const testRef = db.ref('system_health/test_connection');

        // 3. Tulis data uji
        await testRef.set({
            status: 'CONNECTED',
            timestamp: new Date().toISOString(),
            service: 'frss-backend',
        });

        console.log('✅ Berhasil menulis data ke Firebase Realtime Database!');

        // 4. Baca kembali data
        const snapshot = await testRef.once('value');
        console.log('📥 Data terbaca dari Firebase:', snapshot.val());
    } catch (error: any) {
        console.error(
            '❌ Gagal terhubung ke Firebase:',
            error.message || error,
        );
    }
}

testFirebase();
