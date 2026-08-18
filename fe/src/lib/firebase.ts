import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getDatabase } from "firebase/database"; // 1. Ditambahkan import Realtime Database
import { getFirestore } from 'firebase/firestore';

// ---------------------------------------------------------------------
// 1. Config Firebase Utama (FRSS)
// ---------------------------------------------------------------------
const firebaseConfig1 = {
  apiKey: "AIzaSyBxKwPZC4XLDvnlE3FTIcfVH5Pjb7I2brg",
  authDomain: "frss-attendance.firebaseapp.com",
  databaseURL: "https://frss-attendance-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "frss-attendance",
  storageBucket: "frss-attendance.firebasestorage.app",
  messagingSenderId: "898843788127",
  appId: "1:898843788127:web:4d3df14f6fd94a345fecea",
  measurementId: "G-4YL0WKPTCB"
};

// ---------------------------------------------------------------------
// 2. Config Firebase Kedua (Arka)
// ---------------------------------------------------------------------
const firebaseConfig2 = {
  apiKey: "AIzaSyBTdXzDoI9pKSB4Ap_k8A82qpkmDfEGp0M",
  authDomain: "arka-377a2.firebaseapp.com",
  projectId: "arka-377a2",
  storageBucket: "arka-377a2.firebasestorage.app",
  messagingSenderId: "774951430359",
  appId: "1:774951430359:web:a1be8903c2bb4655d2a892",
  measurementId: "G-XLYLEF8M5P"
};

// ---------------------------------------------------------------------
// 3. Inisialisasi Firebase Apps secara Aman
// ---------------------------------------------------------------------

// App 1 (Default App)
const app1 = getApps().find(app => app.name === '[DEFAULT]') 
  ? getApp('[DEFAULT]') 
  : initializeApp(firebaseConfig1);

// App 2 (Secondary App)
const app2 = getApps().find(app => app.name === 'secondaryApp')
  ? getApp('secondaryApp')
  : initializeApp(firebaseConfig2, 'secondaryApp');

// ---------------------------------------------------------------------
// 4. Export Service
// ---------------------------------------------------------------------

// Services Firebase 1 (FRSS)
export const auth1 = getAuth(app1);
export const db1 = getFirestore(app1);     // Cloud Firestore
export const rtdb1 = getDatabase(app1);    // Realtime Database (Dipakai untuk Dashboard Attendance)

// Services Firebase 2 (Arka)
export const auth2 = getAuth(app2);
export const db2 = getFirestore(app2);     // Cloud Firestore