import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  limit,
  onSnapshot,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
} from "firebase/firestore";

import {
  db,
} from "./firebase";


/* =========================================================
   USERNAME NORMALIZATION
   ========================================================= */

function normalizeUsername(
  username,
) {
  return String(
    username || "",
  )
    .trim()
    .toLowerCase();
}


/* =========================================================
   RELATIONSHIP ID

   Both users always generate the same ID.
   ========================================================= */

export function getRelationshipId(
  uidA,
  uidB,
) {
  return [
    uidA,
    uidB,
  ]
    .sort()
    .join("__");
}


/* =========================================================
   SEARCH USERS
   ========================================================= */

export async function searchUsersByUsername(
  username,
  currentUid,
) {
  const search =
    normalizeUsername(
      username,
    );


  if (!search) {
    return [];
  }


  const usersQuery =
    query(
      collection(
        db,
        "users",
      ),

      where(
        "usernameLower",
        "==",
        search,
      ),

      limit(10),
    );


  const snapshot =
    await getDocs(
      usersQuery,
    );


  return snapshot.docs
    .map((userDoc) => ({
      id:
        userDoc.id,

      ...userDoc.data(),
    }))
    .filter(
      (profile) =>
        profile.id !==
        currentUid,
    );
}


/* =========================================================
   GET ONE USER
   ========================================================= */

export async function getUserProfile(
  uid,
) {
  if (!uid) {
    return null;
  }


  const snapshot =
    await getDoc(
      doc(
        db,
        "users",
        uid,
      ),
    );


  if (!snapshot.exists()) {
    return null;
  }


  return {
    id:
      snapshot.id,

    ...snapshot.data(),
  };
}


/* =========================================================
   GET MULTIPLE USERS
   ========================================================= */

export async function getUserProfiles(
  userIds,
) {
  const uniqueIds =
    [
      ...new Set(
        userIds.filter(
          Boolean,
        ),
      ),
    ];


  const profiles =
    await Promise.all(
      uniqueIds.map(
        async (uid) => {
          try {
            return await getUserProfile(
              uid,
            );
          } catch (error) {
            console.error(
              `Unable to load profile ${uid}:`,
              error,
            );

            return null;
          }
        },
      ),
    );


  return profiles.filter(
    Boolean,
  );
}


/* =========================================================
   SEND FRIEND REQUEST
   ========================================================= */

export async function sendFriendRequest(
  currentUid,
  targetUid,
) {
  if (
    !currentUid ||
    !targetUid
  ) {
    throw new Error(
      "Missing user ID.",
    );
  }


  if (
    currentUid === targetUid
  ) {
    throw new Error(
      "You cannot add yourself as a friend.",
    );
  }


  const members =
    [
      currentUid,
      targetUid,
    ].sort();


  const relationshipId =
    getRelationshipId(
      currentUid,
      targetUid,
    );


  const relationshipRef =
    doc(
      db,
      "relationships",
      relationshipId,
    );


  /*
   * IMPORTANT:
   *
   * We intentionally DO NOT call getDoc()
   * before creating this relationship.
   *
   * A nonexistent document cannot pass our
   * member-only read rule.
   *
   * The deterministic document ID already
   * prevents our app from creating another
   * relationship for the same pair.
   */

  try {
    await setDoc(
      relationshipRef,
      {
        members,

        status:
          "pending",

        requestedBy:
          currentUid,

        createdAt:
          serverTimestamp(),

        updatedAt:
          serverTimestamp(),
      },
    );
  } catch (error) {
    if (
      error?.code ===
      "permission-denied"
    ) {
      throw new Error(
        "A friend request or friendship with this user may already exist.",
      );
    }


    throw error;
  }


  return relationshipId;
}


/* =========================================================
   ACCEPT FRIEND REQUEST
   ========================================================= */

export async function acceptFriendRequest(
  relationshipId,
  currentUid,
) {
  const relationshipRef =
    doc(
      db,
      "relationships",
      relationshipId,
    );


  const snapshot =
    await getDoc(
      relationshipRef,
    );


  if (!snapshot.exists()) {
    throw new Error(
      "Friend request no longer exists.",
    );
  }


  const relationship =
    snapshot.data();


  if (
    relationship.status !==
    "pending"
  ) {
    throw new Error(
      "This friend request is no longer pending.",
    );
  }


  if (
    relationship.requestedBy ===
    currentUid
  ) {
    throw new Error(
      "You cannot accept your own friend request.",
    );
  }


  if (
    !relationship.members?.includes(
      currentUid,
    )
  ) {
    throw new Error(
      "You are not part of this friend request.",
    );
  }


  await updateDoc(
    relationshipRef,
    {
      status:
        "friends",

      updatedAt:
        serverTimestamp(),
    },
  );
}


/* =========================================================
   DECLINE FRIEND REQUEST
   ========================================================= */

export async function declineFriendRequest(
  relationshipId,
) {
  await deleteDoc(
    doc(
      db,
      "relationships",
      relationshipId,
    ),
  );
}


/* =========================================================
   CANCEL SENT REQUEST
   ========================================================= */

export async function cancelFriendRequest(
  relationshipId,
) {
  await deleteDoc(
    doc(
      db,
      "relationships",
      relationshipId,
    ),
  );
}


/* =========================================================
   REMOVE FRIEND
   ========================================================= */

export async function removeFriend(
  relationshipId,
) {
  await deleteDoc(
    doc(
      db,
      "relationships",
      relationshipId,
    ),
  );
}


/* =========================================================
   LIVE RELATIONSHIP LISTENER
   ========================================================= */

export function subscribeToRelationships(
  uid,
  callback,
  onError,
) {
  if (!uid) {
    callback([]);

    return () => {};
  }


  const relationshipsQuery =
    query(
      collection(
        db,
        "relationships",
      ),

      where(
        "members",
        "array-contains",
        uid,
      ),
    );


  return onSnapshot(
    relationshipsQuery,

    (snapshot) => {
      const relationships =
        snapshot.docs.map(
          (
            relationshipDoc,
          ) => ({
            id:
              relationshipDoc.id,

            ...relationshipDoc.data(),
          }),
        );


      callback(
        relationships,
      );
    },

    (error) => {
      console.error(
        "Relationship listener failed:",
        error,
      );


      if (onError) {
        onError(
          error,
        );
      }
    },
  );
}


/* =========================================================
   INCOMING REQUESTS
   ========================================================= */

export function getIncomingRequests(
  relationships,
  currentUid,
) {
  return relationships.filter(
    (relationship) =>
      relationship.status ===
        "pending" &&
      relationship.requestedBy !==
        currentUid,
  );
}


/* =========================================================
   OUTGOING REQUESTS
   ========================================================= */

export function getOutgoingRequests(
  relationships,
  currentUid,
) {
  return relationships.filter(
    (relationship) =>
      relationship.status ===
        "pending" &&
      relationship.requestedBy ===
        currentUid,
  );
}


/* =========================================================
   FRIENDSHIPS
   ========================================================= */

export function getFriendships(
  relationships,
) {
  return relationships.filter(
    (relationship) =>
      relationship.status ===
      "friends",
  );
}


/* =========================================================
   GET OTHER USER
   ========================================================= */

export function getOtherUserId(
  relationship,
  currentUid,
) {
  return (
    relationship.members?.find(
      (uid) =>
        uid !== currentUid,
    ) ||
    null
  );
}