import { initializeApp, cert, getApps, getApp, App } from 'firebase-admin/app';
import { getAuth, Auth } from 'firebase-admin/auth';
import { getFirestore, Firestore } from 'firebase-admin/firestore';
import path from 'path';
import fs from 'fs';
import logger from '@/utils/logger';

let app1: App | null = null;
let app2: App | null = null;

let adminAuth1: Auth | null = null;
let adminDb1: Firestore | null = null;
let adminAuth2: Auth | null = null;
let adminDb2: Firestore | null = null;

// Helper untuk membaca credential baik dari env var base64/JSON atau file lokal
const getCredential = (envVarKey: string, localFilePath: string) => {
    // 1. Cek dari Environment Variable (misal di-set di Railway / Server Prod)
    const envVal = process.env[envVarKey];
    if (envVal) {
        try {
            // Cek apakah string JSON langsung atau Base64
            const jsonStr = envVal.trim().startsWith('{')
                ? envVal
                : Buffer.from(envVal, 'base64').toString('utf-8');
            return cert(JSON.parse(jsonStr));
        } catch (err) {
            logger.warn(
                `Failed to parse ${envVarKey} from environment: ${err}`,
            );
        }
    }

    // 2. Cek dari File Lokal (Development)
    if (fs.existsSync(localFilePath)) {
        return cert(localFilePath);
    }

    return null;
};

const serviceAccountKeyFrss = path.resolve(
    __dirname,
    '../../serviceAccountKeyFrss.json',
);
const serviceAccountKeyArka = path.resolve(
    __dirname,
    '../../serviceAccountKeyArka.json',
);

// Inisialisasi App 1 (FRSS - Default)
const cred1 = getCredential(
    'FIREBASE_SERVICE_ACCOUNT_FRSS',
    serviceAccountKeyFrss,
);
if (cred1) {
    app1 = getApps().length ? getApp() : initializeApp({ credential: cred1 });
    adminAuth1 = getAuth(app1);
    adminDb1 = getFirestore(app1);
    logger.info('Firebase App 1 (FRSS) initialized successfully ✅');
} else {
    logger.warn(
        '⚠️ Firebase Service Account Key for FRSS not found. Firebase FRSS features are disabled.',
    );
}

// Inisialisasi App 2 (Arka)
const cred2 = getCredential(
    'FIREBASE_SERVICE_ACCOUNT_ARKA',
    serviceAccountKeyArka,
);
if (cred2) {
    app2 =
        getApps().find(app => app.name === 'arkaApp') ||
        initializeApp({ credential: cred2 }, 'arkaApp');
    adminAuth2 = getAuth(app2);
    adminDb2 = getFirestore(app2);
    logger.info('Firebase App 2 (Arka) initialized successfully ✅');
} else {
    logger.warn(
        '⚠️ Firebase Service Account Key for Arka not found. Firebase Arka features are disabled.',
    );
}

export { app1, app2, adminAuth1, adminDb1, adminAuth2, adminDb2 };
