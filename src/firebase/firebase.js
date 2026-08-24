import {
  initializeApp,
} from "firebase/app";

import {
  getAuth,
} from "firebase/auth";

import {
  getFirestore,
} from "firebase/firestore";


/* =========================================================
   FIREBASE PROJECT 2 CONFIG
   ========================================================= */

const firebaseConfig = {
  apiKey:
    import.meta.env
      .VITE_FIREBASE_API_KEY,

  authDomain:
    import.meta.env
      .VITE_FIREBASE_AUTH_DOMAIN,

  projectId:
    import.meta.env
      .VITE_FIREBASE_PROJECT_ID,

  storageBucket:
    import.meta.env
      .VITE_FIREBASE_STORAGE_BUCKET,

  messagingSenderId:
    import.meta.env
      .VITE_FIREBASE_MESSAGING_SENDER_ID,

  appId:
    import.meta.env
      .VITE_FIREBASE_APP_ID,
};


/* =========================================================
   INITIALIZE FIREBASE PROJECT 2
   ========================================================= */

const app =
  initializeApp(
    firebaseConfig,
  );


/* =========================================================
   SERVICES
   ========================================================= */

export const auth =
  getAuth(app);


export const db =
  getFirestore(app);


/* =========================================================
   DEFAULT EXPORT
   ========================================================= */

export default app;