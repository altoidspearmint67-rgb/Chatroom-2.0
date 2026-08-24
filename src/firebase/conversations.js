import {
  arrayRemove,
  arrayUnion,
  collection,
  doc,
  getDoc,
  increment,
  limit,
  onSnapshot,
  orderBy,
  query,
  runTransaction,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
  writeBatch,
} from "firebase/firestore";

import {
  db,
} from "./firebase";


/* =========================================================
   GENERAL HELPERS
   ========================================================= */

function timestampToMillis(
  value,
) {
  if (!value) {
    return 0;
  }


  if (
    typeof value.toMillis ===
    "function"
  ) {
    return value.toMillis();
  }


  if (
    typeof value.seconds ===
    "number"
  ) {
    return (
      value.seconds *
      1000
    );
  }


  if (
    value instanceof Date
  ) {
    return value.getTime();
  }


  const parsed =
    new Date(
      value,
    ).getTime();


  return Number.isNaN(
    parsed,
  )
    ? 0
    : parsed;
}


function sortConversations(
  conversations,
) {
  return [
    ...conversations,
  ].sort(
    (
      a,
      b,
    ) =>
      timestampToMillis(
        b.lastMessageAt ||
          b.updatedAt ||
          b.createdAt,
      ) -
      timestampToMillis(
        a.lastMessageAt ||
          a.updatedAt ||
          a.createdAt,
      ),
  );
}


/* =========================================================
   DIRECT MESSAGE ID
   ========================================================= */

export function getDmConversationId(
  uidA,
  uidB,
) {
  if (
    !uidA ||
    !uidB
  ) {
    return "";
  }


  return [
    uidA,
    uidB,
  ]
    .sort()
    .join("__");
}


/* =========================================================
   CREATE / OPEN DM
   ========================================================= */

export async function createOrOpenDm(
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
    currentUid ===
    targetUid
  ) {
    throw new Error(
      "You cannot create a DM with yourself.",
    );
  }


  const conversationId =
    getDmConversationId(
      currentUid,
      targetUid,
    );


  await setDoc(
    doc(
      db,
      "conversations",
      conversationId,
    ),
    {
      type:
        "dm",

      members: [
        currentUid,
        targetUid,
      ].sort(),

      updatedAt:
        serverTimestamp(),
    },
    {
      merge:
        true,
    },
  );


  return conversationId;
}


/* =========================================================
   GROUP CODE
   ========================================================= */

const GROUP_CODE_ALPHABET =
  "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

const GROUP_CODE_LENGTH =
  7;


export function normalizeGroupCode(
  value,
) {
  return String(
    value || "",
  )
    .trim()
    .toUpperCase()
    .replace(
      /\s+/g,
      "",
    );
}


export function isValidGroupCode(
  value,
) {
  return /^[A-HJ-NP-Z2-9]{7}$/.test(
    normalizeGroupCode(
      value,
    ),
  );
}


function generateGroupCode() {
  const values =
    new Uint32Array(
      GROUP_CODE_LENGTH,
    );


  crypto.getRandomValues(
    values,
  );


  let code = "";


  for (
    const value of values
  ) {
    code +=
      GROUP_CODE_ALPHABET[
        value %
          GROUP_CODE_ALPHABET.length
      ];
  }


  return code;
}


/* =========================================================
   CREATE GROUP
   ========================================================= */

export async function createGroupChat({
  ownerId,
  name,
  memberIds = [],
}) {
  if (!ownerId) {
    throw new Error(
      "Missing group owner.",
    );
  }


  const cleanName =
    String(
      name || "",
    ).trim();


  if (!cleanName) {
    throw new Error(
      "Enter a group name.",
    );
  }


  if (
    cleanName.length >
    50
  ) {
    throw new Error(
      "Group name must be 50 characters or less.",
    );
  }


  const members =
    Array.from(
      new Set([
        ownerId,

        ...memberIds.filter(
          (
            memberId,
          ) =>
            Boolean(
              memberId,
            ) &&
            memberId !==
              ownerId,
        ),
      ]),
    );


  if (
    members.length >
    25
  ) {
    throw new Error(
      "Groups can currently have up to 25 members.",
    );
  }


  const conversationRef =
    doc(
      collection(
        db,
        "conversations",
      ),
    );


  for (
    let attempt = 0;
    attempt < 10;
    attempt += 1
  ) {
    const joinCode =
      generateGroupCode();


    const codeRef =
      doc(
        db,
        "groupCodes",
        joinCode,
      );


    try {
      await runTransaction(
        db,

        async (
          transaction,
        ) => {
          const existingCode =
            await transaction.get(
              codeRef,
            );


          if (
            existingCode.exists()
          ) {
            throw new Error(
              "GROUP_CODE_COLLISION",
            );
          }


          transaction.set(
            conversationRef,
            {
              type:
                "group",

              name:
                cleanName,

              ownerId,

              members,

              joinCode,

              createdAt:
                serverTimestamp(),

              updatedAt:
                serverTimestamp(),
            },
          );


          transaction.set(
            codeRef,
            {
              conversationId:
                conversationRef.id,

              createdAt:
                serverTimestamp(),
            },
          );
        },
      );


      return {
        conversationId:
          conversationRef.id,

        joinCode,
      };
    } catch (error) {
      if (
        error?.message ===
        "GROUP_CODE_COLLISION"
      ) {
        continue;
      }


      throw error;
    }
  }


  throw new Error(
    "Unable to generate a group code. Try again.",
  );
}


/* =========================================================
   JOIN GROUP WITH CODE
   ========================================================= */

export async function joinGroupByCode({
  userId,
  code,
}) {
  if (!userId) {
    throw new Error(
      "You must be signed in.",
    );
  }


  const cleanCode =
    normalizeGroupCode(
      code,
    );


  if (
    !isValidGroupCode(
      cleanCode,
    )
  ) {
    throw new Error(
      "Enter a valid 7-character group code.",
    );
  }


  const codeRef =
    doc(
      db,
      "groupCodes",
      cleanCode,
    );


  const codeSnapshot =
    await getDoc(
      codeRef,
    );


  if (
    !codeSnapshot.exists()
  ) {
    throw new Error(
      "Group code not found.",
    );
  }


  const conversationId =
    codeSnapshot.data()
      ?.conversationId;


  if (!conversationId) {
    throw new Error(
      "This group code is invalid.",
    );
  }


  /*
   * Create proof that this user supplied
   * this exact group code.
   */

  await setDoc(
    doc(
      db,
      "groupCodes",
      cleanCode,
      "claims",
      userId,
    ),
    {
      userId,

      createdAt:
        serverTimestamp(),
    },
    {
      merge:
        true,
    },
  );


  await updateDoc(
    doc(
      db,
      "conversations",
      conversationId,
    ),
    {
      members:
        arrayUnion(
          userId,
        ),

      updatedAt:
        serverTimestamp(),
    },
  );


  return conversationId;
}


/* =========================================================
   GET CONVERSATION
   ========================================================= */

export async function getConversation(
  conversationId,
) {
  if (!conversationId) {
    return null;
  }


  const snapshot =
    await getDoc(
      doc(
        db,
        "conversations",
        conversationId,
      ),
    );


  if (
    !snapshot.exists()
  ) {
    return null;
  }


  return {
    id:
      snapshot.id,

    ...snapshot.data(),
  };
}


/* =========================================================
   SUBSCRIBE TO ONE CONVERSATION
   ========================================================= */

export function subscribeToConversation(
  conversationId,
  callback,
  onError,
) {
  if (!conversationId) {
    callback?.(
      null,
    );

    return () => {};
  }


  return onSnapshot(
    doc(
      db,
      "conversations",
      conversationId,
    ),

    (
      snapshot,
    ) => {
      if (
        !snapshot.exists()
      ) {
        callback?.(
          null,
        );

        return;
      }


      callback?.({
        id:
          snapshot.id,

        ...snapshot.data(),
      });
    },

    (
      error,
    ) => {
      console.error(
        "Conversation subscription failed:",
        error,
      );


      onError?.(
        error,
      );
    },
  );
}


/* =========================================================
   ALL CONVERSATIONS
   ========================================================= */

export function subscribeToConversations(
  uid,
  callback,
  onError,
) {
  if (!uid) {
    callback?.([]);

    return () => {};
  }


  const conversationsQuery =
    query(
      collection(
        db,
        "conversations",
      ),

      where(
        "members",
        "array-contains",
        uid,
      ),
    );


  return onSnapshot(
    conversationsQuery,

    (
      snapshot,
    ) => {
      const conversations =
        snapshot.docs.map(
          (
            conversationDoc,
          ) => ({
            id:
              conversationDoc.id,

            ...conversationDoc.data(),
          }),
        );


      callback?.(
        sortConversations(
          conversations,
        ),
      );
    },

    (
      error,
    ) => {
      console.error(
        "Conversation list subscription failed:",
        error,
      );


      onError?.(
        error,
      );
    },
  );
}


/* =========================================================
   DM ONLY
   ========================================================= */

export function subscribeToDmConversations(
  uid,
  callback,
  onError,
) {
  return subscribeToConversations(
    uid,

    (
      conversations,
    ) =>
      callback?.(
        conversations.filter(
          (
            conversation,
          ) =>
            conversation.type ===
            "dm",
        ),
      ),

    onError,
  );
}


/* =========================================================
   GROUP ONLY
   ========================================================= */

export function subscribeToGroupConversations(
  uid,
  callback,
  onError,
) {
  return subscribeToConversations(
    uid,

    (
      conversations,
    ) =>
      callback?.(
        conversations.filter(
          (
            conversation,
          ) =>
            conversation.type ===
            "group",
        ),
      ),

    onError,
  );
}


/* =========================================================
   DM HELPER
   ========================================================= */

export function getOtherDmUserId(
  conversation,
  currentUid,
) {
  if (
    !conversation ||
    conversation.type !==
      "dm" ||
    !Array.isArray(
      conversation.members,
    )
  ) {
    return null;
  }


  return (
    conversation.members.find(
      (
        memberId,
      ) =>
        memberId !==
        currentUid,
    ) ||
    null
  );
}


/* =========================================================
   GROUP ADMIN
   ========================================================= */

export function isGroupConversation(
  conversation,
) {
  return (
    conversation?.type ===
    "group"
  );
}


export function isGroupOwner(
  conversation,
  userId,
) {
  return Boolean(
    conversation?.type ===
      "group" &&
    conversation.ownerId ===
      userId,
  );
}


/*
 * Same meaning as owner right now.
 *
 * We use a named admin helper so later,
 * if you decide groups should support
 * multiple admins, we can expand it.
 */

export function isGroupAdmin(
  conversation,
  userId,
) {
  return isGroupOwner(
    conversation,
    userId,
  );
}


/* =========================================================
   RENAME GROUP

   CREATOR / ADMIN ONLY
   ========================================================= */

export async function renameGroupChat({
  conversationId,
  userId,
  name,
}) {
  if (
    !conversationId ||
    !userId
  ) {
    throw new Error(
      "Missing group information.",
    );
  }


  const cleanName =
    String(
      name || "",
    ).trim();


  if (!cleanName) {
    throw new Error(
      "Enter a group name.",
    );
  }


  if (
    cleanName.length >
    50
  ) {
    throw new Error(
      "Group name must be 50 characters or less.",
    );
  }


  const conversation =
    await getConversation(
      conversationId,
    );


  if (
    !conversation ||
    conversation.type !==
      "group"
  ) {
    throw new Error(
      "Group not found.",
    );
  }


  if (
    conversation.ownerId !==
    userId
  ) {
    throw new Error(
      "Only the group admin can rename this group.",
    );
  }


  await updateDoc(
    doc(
      db,
      "conversations",
      conversationId,
    ),
    {
      name:
        cleanName,

      updatedAt:
        serverTimestamp(),
    },
  );
}


/* =========================================================
   ADD PEOPLE TO GROUP

   CREATOR / ADMIN ONLY
   ========================================================= */

export async function addGroupMembers({
  conversationId,
  userId,
  memberIds = [],
}) {
  if (
    !conversationId ||
    !userId
  ) {
    throw new Error(
      "Missing group information.",
    );
  }


  const conversation =
    await getConversation(
      conversationId,
    );


  if (
    !conversation ||
    conversation.type !==
      "group"
  ) {
    throw new Error(
      "Group not found.",
    );
  }


  if (
    conversation.ownerId !==
    userId
  ) {
    throw new Error(
      "Only the group admin can add people.",
    );
  }


  const existingMembers =
    Array.isArray(
      conversation.members,
    )
      ? conversation.members
      : [];


  const newMembers =
    Array.from(
      new Set(
        memberIds,
      ),
    ).filter(
      (
        memberId,
      ) =>
        Boolean(
          memberId,
        ) &&
        !existingMembers.includes(
          memberId,
        ),
    );


  if (
    newMembers.length ===
    0
  ) {
    throw new Error(
      "Select at least one new member.",
    );
  }


  if (
    existingMembers.length +
      newMembers.length >
    25
  ) {
    throw new Error(
      "Groups can currently have up to 25 members.",
    );
  }


  await updateDoc(
    doc(
      db,
      "conversations",
      conversationId,
    ),
    {
      members:
        arrayUnion(
          ...newMembers,
        ),

      updatedAt:
        serverTimestamp(),
    },
  );
}


/* =========================================================
   MESSAGES
   ========================================================= */

export function subscribeToMessages(
  conversationId,
  callback,
  onError,
) {
  if (!conversationId) {
    callback?.([]);

    return () => {};
  }


  const messagesQuery =
    query(
      collection(
        db,
        "conversations",
        conversationId,
        "messages",
      ),

      orderBy(
        "createdAt",
        "desc",
      ),

      limit(100),
    );


  return onSnapshot(
    messagesQuery,

    (
      snapshot,
    ) => {
      callback?.(
        snapshot.docs
          .map(
            (
              messageDoc,
            ) => ({
              id:
                messageDoc.id,

              ...messageDoc.data(),
            }),
          )
          .reverse(),
      );
    },

    (
      error,
    ) => {
      console.error(
        "Message subscription failed:",
        error,
      );


      onError?.(
        error,
      );
    },
  );
}


/* =========================================================
   SEND MESSAGE
   ========================================================= */

export async function sendMessage({
  conversationId,
  authorId,
  content,
  replyToId = null,
}) {
  const cleanContent =
    String(
      content || "",
    ).trim();


  if (
    !conversationId ||
    !authorId
  ) {
    throw new Error(
      "Missing message information.",
    );
  }


  if (!cleanContent) {
    throw new Error(
      "Message cannot be empty.",
    );
  }


  if (
    cleanContent.length >
    4000
  ) {
    throw new Error(
      "Message is too long.",
    );
  }


  const conversationRef =
    doc(
      db,
      "conversations",
      conversationId,
    );


  const messageRef =
    doc(
      collection(
        db,
        "conversations",
        conversationId,
        "messages",
      ),
    );


  const userRef =
    doc(
      db,
      "users",
      authorId,
    );


  const batch =
    writeBatch(db);


  batch.set(
    messageRef,
    {
      authorId,

      content:
        cleanContent,

      createdAt:
        serverTimestamp(),

      editedAt:
        null,

      deleted:
        false,

      deletedAt:
        null,

      replyToId:
        replyToId ||
        null,

      pinned:
        false,

      pinnedAt:
        null,

      pinnedBy:
        null,
    },
  );


  batch.update(
    conversationRef,
    {
      lastMessageId:
        messageRef.id,

      lastMessage:
        cleanContent,

      lastMessageAuthorId:
        authorId,

      lastMessageAt:
        serverTimestamp(),

      updatedAt:
        serverTimestamp(),
    },
  );


  batch.update(
    userRef,
    {
      messageCount:
        increment(1),
    },
  );


  await batch.commit();


  return messageRef.id;
}


/* =========================================================
   EDIT MESSAGE
   ========================================================= */

export async function editMessage({
  conversationId,
  messageId,
  content,
}) {
  const cleanContent =
    String(
      content || "",
    ).trim();


  if (
    !conversationId ||
    !messageId
  ) {
    throw new Error(
      "Missing message information.",
    );
  }


  if (!cleanContent) {
    throw new Error(
      "Message cannot be empty.",
    );
  }


  if (
    cleanContent.length >
    4000
  ) {
    throw new Error(
      "Message is too long.",
    );
  }


  await updateDoc(
    doc(
      db,
      "conversations",
      conversationId,
      "messages",
      messageId,
    ),
    {
      content:
        cleanContent,

      editedAt:
        serverTimestamp(),
    },
  );


  const conversation =
    await getConversation(
      conversationId,
    );


  if (
    conversation?.lastMessageId ===
    messageId
  ) {
    await updateDoc(
      doc(
        db,
        "conversations",
        conversationId,
      ),
      {
        lastMessage:
          cleanContent,

        updatedAt:
          serverTimestamp(),
      },
    );
  }
}


/* =========================================================
   DELETE MESSAGE
   ========================================================= */

export async function deleteMessage({
  conversationId,
  messageId,
}) {
  if (
    !conversationId ||
    !messageId
  ) {
    throw new Error(
      "Missing message information.",
    );
  }


  await updateDoc(
    doc(
      db,
      "conversations",
      conversationId,
      "messages",
      messageId,
    ),
    {
      content:
        "",

      deleted:
        true,

      deletedAt:
        serverTimestamp(),

      editedAt:
        null,

      pinned:
        false,

      pinnedAt:
        null,

      pinnedBy:
        null,
    },
  );


  const conversation =
    await getConversation(
      conversationId,
    );


  if (
    conversation?.lastMessageId ===
    messageId
  ) {
    await updateDoc(
      doc(
        db,
        "conversations",
        conversationId,
      ),
      {
        lastMessage:
          "Message deleted",

        updatedAt:
          serverTimestamp(),
      },
    );
  }
}


/* =========================================================
   MESSAGE PINNING
   ========================================================= */

export async function pinMessage({
  conversationId,
  messageId,
  userId,
}) {
  await updateDoc(
    doc(
      db,
      "conversations",
      conversationId,
      "messages",
      messageId,
    ),
    {
      pinned:
        true,

      pinnedAt:
        serverTimestamp(),

      pinnedBy:
        userId,
    },
  );
}


export async function unpinMessage({
  conversationId,
  messageId,
}) {
  await updateDoc(
    doc(
      db,
      "conversations",
      conversationId,
      "messages",
      messageId,
    ),
    {
      pinned:
        false,

      pinnedAt:
        null,

      pinnedBy:
        null,
    },
  );
}


export async function toggleMessagePin({
  conversationId,
  messageId,
  userId,
  currentlyPinned,
}) {
  if (
    currentlyPinned
  ) {
    return unpinMessage({
      conversationId,
      messageId,
    });
  }


  return pinMessage({
    conversationId,
    messageId,
    userId,
  });
}


/* =========================================================
   PINNED MESSAGES
   ========================================================= */

export function subscribeToPinnedMessages(
  conversationId,
  callback,
  onError,
) {
  const pinnedQuery =
    query(
      collection(
        db,
        "conversations",
        conversationId,
        "messages",
      ),

      where(
        "pinned",
        "==",
        true,
      ),
    );


  return onSnapshot(
    pinnedQuery,

    (
      snapshot,
    ) => {
      const messages =
        snapshot.docs.map(
          (
            messageDoc,
          ) => ({
            id:
              messageDoc.id,

            ...messageDoc.data(),
          }),
        );


      messages.sort(
        (
          a,
          b,
        ) =>
          timestampToMillis(
            b.pinnedAt,
          ) -
          timestampToMillis(
            a.pinnedAt,
          ),
      );


      callback?.(
        messages,
      );
    },

    onError,
  );
}


/* =========================================================
   REPLY REFERENCE
   ========================================================= */

export function createReplyReference(
  message,
) {
  if (!message) {
    return null;
  }


  return {
    id:
      message.id,

    authorId:
      message.authorId,

    content:
      message.content,

    createdAt:
      message.createdAt,
  };
}


/* =========================================================
   SIDEBAR CONVERSATION PINNING
   ========================================================= */

export async function pinConversation(
  conversationId,
  userId,
) {
  await updateDoc(
    doc(
      db,
      "conversations",
      conversationId,
    ),
    {
      pinnedBy:
        arrayUnion(
          userId,
        ),
    },
  );
}


export async function unpinConversation(
  conversationId,
  userId,
) {
  await updateDoc(
    doc(
      db,
      "conversations",
      conversationId,
    ),
    {
      pinnedBy:
        arrayRemove(
          userId,
        ),
    },
  );
}


export function isConversationPinned(
  conversation,
  userId,
) {
  return Boolean(
    userId &&
    Array.isArray(
      conversation
        ?.pinnedBy,
    ) &&
    conversation.pinnedBy.includes(
      userId,
    )
  );
}