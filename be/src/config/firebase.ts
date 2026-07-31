import { initializeApp, cert, getApps, getApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import path from 'path';

// Path disesuaikan ke root folder (frss-attendance/)
const serviceAccountKeyFrss = path.resolve(__dirname, '../../serviceAccountKeyFrss.json');
const serviceAccountKeyArka = path.resolve(__dirname, '../../serviceAccountKeyArka.json');

// Inisialisasi App 1 (FRSS - Default)
export const app1 = getApps().length 
  ? getApp() 
  : initializeApp({
      credential: cert(serviceAccountKeyFrss)
    });

// Inisialisasi App 2 (Arka)
export const app2 = getApps().find(app => app.name === 'arkaApp') 
  || initializeApp({
      credential: cert(serviceAccountKeyArka)
    }, 'arkaApp');

// Export Service
export const adminAuth1 = getAuth(app1);
export const adminDb1 = getFirestore(app1);

export const adminAuth2 = getAuth(app2);
export const adminDb2 = getFirestore(app2);