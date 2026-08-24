import {
  getApp,
  getApps,
  initializeApp,
} from "firebase/app";

import {
  getAuth,
} from "firebase/auth";

import {
  getDatabase,
} from "firebase/database";


const legacyFirebaseConfig = {
  apiKey:
    import.meta.env.VITE_LEGACY_FIREBASE_API_KEY,

  authDomain:
    import.meta.env.VITE_LEGACY_FIREBASE_AUTH_DOMAIN,

  databaseURL:
    import.meta.env.VITE_LEGACY_FIREBASE_DATABASE_URL,

  projectId:
    import.meta.env.VITE_LEGACY_FIREBASE_PROJECT_ID,

  storageBucket:
    import.meta.env.VITE_LEGACY_FIREBASE_STORAGE_BUCKET,

  messagingSenderId:
    import.meta.env.VITE_LEGACY_FIREBASE_MESSAGING_SENDER_ID,

  appId:
    import.meta.env.VITE_LEGACY_FIREBASE_APP_ID,
};


const LEGACY_APP_NAME =
  "legacy-chatroom";


export const legacyApp =
  getApps().some(
    (app) =>
      app.name ===
      LEGACY_APP_NAME,
  )
    ? getApp(
        LEGACY_APP_NAME,
      )
    : initializeApp(
        legacyFirebaseConfig,
        LEGACY_APP_NAME,
      );


export const legacyAuth =
  getAuth(
    legacyApp,
  );


export const legacyDb =
  getDatabase(
    legacyApp,
  );