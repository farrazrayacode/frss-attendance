import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyBxKwPZC4XLDvnlE3FTIcfVH5Pjb7I2brg",
  authDomain: "frss-attendance.firebaseapp.com",
  databaseURL: "https://frss-attendance-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "frss-attendance",
  storageBucket: "frss-attendance.firebasestorage.app",
  messagingSenderId: "898843788127",
  appId: "1:898843788127:web:4d3df14f6fd94a345fecea",
  measurementId: "G-4YL0WKPTCB"
};

const firebaseConfig1 = {
  apiKey: "AIzaSyBTdXzDoI9pKSB4Ap_k8A82qpkmDfEGp0M",
  authDomain: "arka-377a2.firebaseapp.com",
  databaseURL: "https://arka-377a2-default-rtdb.firebaseio.com",
  projectId: "arka-377a2",
  storageBucket: "arka-377a2.firebasestorage.app",
  messagingSenderId: "774951430359",
  appId: "1:774951430359:web:a1be8903c2bb4655d2a892",
  measurementId: "G-XLYLEF8M5P"
};

const appPrimary = !getApps().some(app => app.name === '[DEFAULT]')
    ? initializeApp(firebaseConfig)
    : getApp();

const appSecondary = !getApps().some(app => app.name === 'secondaryApp')
    ? initializeApp(firebaseConfig1, 'secondaryApp')
    : getApp('secondaryApp');

export const dbMain = getFirestore(appPrimary);
export const dbSecondary = getFirestore(appSecondary);

export const auth1 = getAuth(appPrimary);
export const auth2 = getAuth(appSecondary);