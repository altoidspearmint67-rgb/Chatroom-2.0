import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  createUserWithEmailAndPassword,
  deleteUser,
  onAuthStateChanged,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
} from "firebase/auth";

import {
  get,
  ref,
} from "firebase/database";

import {
  doc,
  getDoc,
  serverTimestamp,
  setDoc,
  Timestamp,
  updateDoc,
} from "firebase/firestore";

import {
  auth,
  db,
} from "../firebase/firebase";

import {
  legacyAuth,
  legacyDb,
} from "../firebase/legacyFirebase";


const AuthContext =
  createContext(null);


/* =========================================================
   CUSTOM AUTH ERROR
   ========================================================= */

function createAuthError(
  code,
  message,
) {
  const error =
    new Error(message);

  error.code = code;

  return error;
}


/* =========================================================
   USERNAME HELPER
   ========================================================= */

function normalizeUsernameForSearch(
  username,
) {
  return String(
    username || "",
  )
    .trim()
    .toLowerCase();
}


/* =========================================================
   SHOULD WE CHECK OLD FIREBASE?
   ========================================================= */

function shouldTryLegacy(error) {
  return [
    "auth/invalid-credential",
    "auth/user-not-found",
    "auth/wrong-password",
  ].includes(error?.code);
}


/* =========================================================
   MAKE SURE EXISTING USERS HAVE usernameLower

   This is especially useful for users who were already
   migrated before we added usernameLower.
   ========================================================= */

async function ensureUsernameLower(
  firebaseUser,
) {
  if (!firebaseUser?.uid) {
    return;
  }


  try {
    const userRef =
      doc(
        db,
        "users",
        firebaseUser.uid,
      );


    const snapshot =
      await getDoc(
        userRef,
      );


    if (!snapshot.exists()) {
      return;
    }


    const profile =
      snapshot.data();


    const username =
      profile.username ||
      profile.displayName ||
      firebaseUser.displayName ||
      "";


    const usernameLower =
      normalizeUsernameForSearch(
        username,
      );


    if (!usernameLower) {
      return;
    }


    if (
      profile.usernameLower !==
      usernameLower
    ) {
      await updateDoc(
        userRef,
        {
          usernameLower,
          updatedAt:
            serverTimestamp(),
        },
      );
    }
  } catch (error) {
    console.error(
      "Unable to ensure usernameLower:",
      error,
    );
  }
}


/* =========================================================
   AUTH PROVIDER
   ========================================================= */

export function AuthProvider({
  children,
}) {
  const [
    user,
    setUser,
  ] = useState(null);

  const [
    loading,
    setLoading,
  ] = useState(true);


  /* =========================================================
     WATCH PROJECT 2 SESSION
     ========================================================= */

  useEffect(() => {
    const unsubscribe =
      onAuthStateChanged(
        auth,
        (firebaseUser) => {
          setUser(
            firebaseUser,
          );

          setLoading(false);


          /*
           * Existing accounts created before
           * usernameLower was added will be
           * automatically updated here.
           */
          if (firebaseUser) {
            ensureUsernameLower(
              firebaseUser,
            );
          }
        },
      );


    return unsubscribe;
  }, []);


  /* =========================================================
     NEW CHATROOM ACCOUNT
     ========================================================= */

  async function signUp({
    username,
    email,
    password,
  }) {
    const cleanUsername =
      username.trim();

    const usernameLower =
      normalizeUsernameForSearch(
        cleanUsername,
      );

    const cleanEmail =
      email
        .trim()
        .toLowerCase();


    const credential =
      await createUserWithEmailAndPassword(
        auth,
        cleanEmail,
        password,
      );


    try {
      /* =====================================================
         FIREBASE AUTH PROFILE
         ===================================================== */

      await updateProfile(
        credential.user,
        {
          displayName:
            cleanUsername,
        },
      );


      /* =====================================================
         FIRESTORE PROFILE
         ===================================================== */

      await setDoc(
        doc(
          db,
          "users",
          credential.user.uid,
        ),
        {
          uid:
            credential.user.uid,

          username:
            cleanUsername,

          usernameLower,

          displayName:
            cleanUsername,


          /* =================================================
             PROFILE PICTURE
             ================================================= */

          avatarURL: "",

          needsAvatarSetup:
            true,


          /* =================================================
             ROLE + TITLE
             ================================================= */

          role:
            "Member",

          title:
            "Member",


          /* =================================================
             BADGES
             ================================================= */

          badges: [],


          /* =================================================
             STATS
             ================================================= */

          messageCount: 0,

          credits: 0,


          /* =================================================
             STATUS
             ================================================= */

          status:
            "Online",


          /* =================================================
             DATES
             ================================================= */

          createdAt:
            serverTimestamp(),

          lastSeenAt:
            serverTimestamp(),


          /* =================================================
             MIGRATION STATE
             ================================================= */

          migratedFromLegacy:
            false,
        },
      );


      return credential.user;
    } catch (error) {
      /*
       * Remove the Authentication account
       * if Firestore profile creation fails.
       */

      try {
        await deleteUser(
          credential.user,
        );
      } catch {
        // Ignore rollback error.
      }


      throw error;
    }
  }


  /* =========================================================
     MIGRATE PROJECT 1 USER
     ========================================================= */

  async function migrateLegacyUser({
    email,
    password,
  }) {
    const cleanEmail =
      email
        .trim()
        .toLowerCase();


    try {
      /* =====================================================
         STEP 1
         VERIFY PROJECT 1 CREDENTIALS
         ===================================================== */

      const legacyCredential =
        await signInWithEmailAndPassword(
          legacyAuth,
          cleanEmail,
          password,
        );


      const legacyUser =
        legacyCredential.user;


      /* =====================================================
         STEP 2
         LOAD PROJECT 1 PROFILE
         ===================================================== */

      const snapshot =
        await get(
          ref(
            legacyDb,
            `users/${legacyUser.uid}`,
          ),
        );


      if (!snapshot.exists()) {
        throw createAuthError(
          "auth/legacy-profile-not-found",
          "The old Chatroom account exists, but its profile could not be found.",
        );
      }


      const legacyProfile =
        snapshot.val();


      /* =====================================================
         STEP 3
         VERIFY EMAIL MATCH
         ===================================================== */

      const storedEmail =
        String(
          legacyProfile.email ||
            legacyUser.email ||
            "",
        )
          .trim()
          .toLowerCase();


      if (
        !storedEmail ||
        storedEmail !== cleanEmail
      ) {
        throw createAuthError(
          "auth/legacy-profile-mismatch",
          "The legacy account information did not match.",
        );
      }


      /* =====================================================
         STEP 4
         ORIGINAL JOIN DATE
         ===================================================== */

      let createdAt =
        serverTimestamp();


      if (
        legacyProfile.registrationDate
      ) {
        const legacyDate =
          new Date(
            legacyProfile.registrationDate,
          );


        if (
          !Number.isNaN(
            legacyDate.getTime(),
          )
        ) {
          createdAt =
            Timestamp.fromDate(
              legacyDate,
            );
        }
      }


      /* =====================================================
         STEP 5
         USERNAME
         ===================================================== */

      const username =
        String(
          legacyProfile.username ||
            legacyUser.displayName ||
            cleanEmail.split("@")[0],
        ).trim();


      const usernameLower =
        normalizeUsernameForSearch(
          username,
        );


      /* =====================================================
         STEP 6
         OLD ROLE
         ===================================================== */

      const role =
        String(
          legacyProfile.role ||
            "Member",
        ).trim();


      /* =====================================================
         STEP 7
         OLD TITLE
         ===================================================== */

      const title =
        String(
          legacyProfile.title ||
            "Member",
        ).trim();


      /* =====================================================
         STEP 8
         CREATE PROJECT 2 AUTH ACCOUNT
         ===================================================== */

      let newCredential;


      try {
        newCredential =
          await createUserWithEmailAndPassword(
            auth,
            cleanEmail,
            password,
          );
      } catch (error) {
        if (
          error?.code ===
          "auth/email-already-in-use"
        ) {
          throw createAuthError(
            "auth/already-migrated",
            "This account already exists in the new Chatroom.",
          );
        }


        throw error;
      }


      /* =====================================================
         STEP 9
         CREATE PROJECT 2 FIRESTORE PROFILE
         ===================================================== */

      try {
        await updateProfile(
          newCredential.user,
          {
            displayName:
              username,
          },
        );


        await setDoc(
          doc(
            db,
            "users",
            newCredential.user.uid,
          ),
          {
            /* ===============================================
               IDENTITY
               =============================================== */

            uid:
              newCredential.user.uid,

            username,

            usernameLower,

            displayName:
              username,


            /* ===============================================
               PROFILE PICTURE

               Old Project 1 avatars are intentionally
               not migrated.
               =============================================== */

            avatarURL: "",

            needsAvatarSetup:
              true,


            /* ===============================================
               ROLE + TITLE
               =============================================== */

            role,

            title,


            /* ===============================================
               BADGES
               =============================================== */

            badges: [],


            /* ===============================================
               OLD STATS
               =============================================== */

            messageCount:
              Number(
                legacyProfile.messageCount,
              ) || 0,

            credits:
              Number(
                legacyProfile.credits,
              ) || 0,


            /* ===============================================
               STATUS
               =============================================== */

            status:
              "Online",


            /* ===============================================
               ORIGINAL JOIN DATE
               =============================================== */

            createdAt,

            lastSeenAt:
              serverTimestamp(),


            /* ===============================================
               INTERNAL MIGRATION DATA
               =============================================== */

            migratedFromLegacy:
              true,

            legacyUid:
              legacyUser.uid,

            legacyProject:
              "copycat20",

            legacyRegistrationDate:
              legacyProfile.registrationDate ||
              null,

            migratedAt:
              serverTimestamp(),
          },
        );


        return newCredential.user;
      } catch (error) {
        try {
          await deleteUser(
            newCredential.user,
          );
        } catch {
          // Ignore rollback error.
        }


        throw error;
      }
    } finally {
      /* =====================================================
         LOG OUT OF PROJECT 1
         ===================================================== */

      try {
        await signOut(
          legacyAuth,
        );
      } catch {
        // Ignore legacy logout error.
      }
    }
  }


  /* =========================================================
     LOGIN
     ========================================================= */

  async function signIn({
    email,
    password,
  }) {
    const cleanEmail =
      email
        .trim()
        .toLowerCase();


    /* =======================================================
       TRY PROJECT 2 FIRST
       ======================================================= */

    try {
      const credential =
        await signInWithEmailAndPassword(
          auth,
          cleanEmail,
          password,
        );


      /*
       * Also make sure older Project 2
       * profiles have usernameLower.
       */
      await ensureUsernameLower(
        credential.user,
      );


      return credential.user;
    } catch (project2Error) {
      if (
        !shouldTryLegacy(
          project2Error,
        )
      ) {
        throw project2Error;
      }


      /* =====================================================
         TRY PROJECT 1 + MIGRATION
         ===================================================== */

      try {
        return await migrateLegacyUser({
          email:
            cleanEmail,

          password,
        });
      } catch (legacyError) {
        if (
          [
            "auth/legacy-profile-not-found",
            "auth/legacy-profile-mismatch",
            "auth/already-migrated",
          ].includes(
            legacyError?.code,
          )
        ) {
          throw legacyError;
        }


        throw project2Error;
      }
    }
  }


  /* =========================================================
     PASSWORD RESET
     ========================================================= */

  function resetPassword(
    email,
  ) {
    return sendPasswordResetEmail(
      auth,
      email
        .trim()
        .toLowerCase(),
    );
  }


  /* =========================================================
     LOGOUT
     ========================================================= */

  function logout() {
    return signOut(auth);
  }


  /* =========================================================
     CONTEXT VALUE
     ========================================================= */

  const value =
    useMemo(
      () => ({
        user,
        loading,

        signUp,
        signIn,
        logout,
        resetPassword,
      }),
      [
        user,
        loading,
      ],
    );


  return (
    <AuthContext.Provider
      value={value}
    >
      {children}
    </AuthContext.Provider>
  );
}


/* =========================================================
   AUTH HOOK
   ========================================================= */

export function useAuth() {
  const context =
    useContext(
      AuthContext,
    );


  if (!context) {
    throw new Error(
      "useAuth must be used inside AuthProvider",
    );
  }


  return context;
}