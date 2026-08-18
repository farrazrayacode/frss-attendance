const sqlite3 = require('sqlite3');
const { open } = require('sqlite');
const { initializeApp, cert } = require('firebase-admin/app');
const { getDatabase } = require('firebase-admin/database');
const fs = require('fs');

// 1. Load Service Account Key
const serviceAccount = JSON.parse(
    fs.readFileSync('./serviceAccountKey.json', 'utf8')
);

// 2. Inisialisasi Firebase Admin
initializeApp({
    credential: cert(serviceAccount),
    // ⚠️ PASTIKAN URL INI SAMA PERSIS DENGAN YANG DI FIREBASE CONSOLE KAMU ⚠️
    databaseURL: "https://frss-attendance-default-rtdb.asia-southeast1.firebasedatabase.app"
});

const dbFirebase = getDatabase();

async function migrate() {
    console.log("🚀 Memulai migrasi dari SQLite ke Firebase...");

    // 3. Buka Database SQLite
    const dbSqlite = await open({
        filename: './sv-fs.sqlite',
        driver: sqlite3.Database
    });

    // 4. Ambil daftar semua tabel
    const tables = await dbSqlite.all(
        "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%';"
    );

    console.log(`📋 Ditemukan ${tables.length} tabel di SQLite.\n`);

    // 5. Loop tiap tabel dan upload ke Firebase
    for (const tableObj of tables) {
        const tableName = tableObj.name;
        
        try {
            const rows = await dbSqlite.all(`SELECT * FROM ${tableName}`);
            console.log(`📦 Memindahkan tabel '${tableName}' (${rows.length} data)...`);

            if (rows.length === 0) {
                console.log(`   └─ ⚠️ Tabel '${tableName}' kosong, dilewati.`);
                continue;
            }

            const firebaseData = {};
            rows.forEach((row, index) => {
                const id = row.id || row.uuid || `item_${index + 1}`;
                firebaseData[id] = row;
            });

            // Kirim ke Firebase dengan timeout
            await dbFirebase.ref(tableName).set(firebaseData);
            console.log(`   └─ ✅ Tabel '${tableName}' SUKSES dipindahkan!`);

        } catch (error) {
            console.error(`   └─ ❌ Gagal memindahkan tabel '${tableName}':`, error.message);
        }
    }

    console.log("\n🎉 MIGRASI SELESAI! Silakan cek Firebase Console kamu.");
    process.exit(0);
}

migrate().catch((err) => {
    console.error("❌ Terjadi error utama:", err);
    process.exit(1);
});