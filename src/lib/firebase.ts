import { FirebaseApp, getApp, getApps, initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET
};

function hasFirebaseConfig() {
  return Boolean(
    firebaseConfig.apiKey
      && firebaseConfig.authDomain
      && firebaseConfig.projectId
      && firebaseConfig.appId
      && firebaseConfig.messagingSenderId
  );
}

let firebaseApp: FirebaseApp | null = null;

export function getFirebaseApp() {
  if (!hasFirebaseConfig()) {
    throw new Error("Firebase configuration is missing. Check your Vite environment variables.");
  }

  if (!firebaseApp) {
    firebaseApp = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
  }

  return firebaseApp;
}

export function getFirebaseAuthInstance() {
  return getAuth(getFirebaseApp());
}
