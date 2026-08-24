import {
  Navigate,
  useParams,
} from "react-router-dom";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  TextChannel,
} from "./text/TextChannel";

import {
  useAuth,
} from "../../auth/AuthContext";

import {
  useCurrentProfile,
} from "../../auth/useCurrentProfile";

import {
  getUserProfiles,
} from "../../firebase/friends";

import {
  getOtherDmUserId,
  subscribeToConversation,
  subscribeToMessages,
} from "../../firebase/conversations";


/* =========================================================
   TIMESTAMP HELPER
   ========================================================= */

function timestampToMillis(
  value,
) {
  if (!value) {
    return Date.now();
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
    ? Date.now()
    : parsed;
}


/* =========================================================
   CHANNEL PAGE
   ========================================================= */

export function ChannelPage() {
  const {
    channel,
  } = useParams();


  const {
    user,
  } = useAuth();


  const {
    profile:
      currentProfile,
  } = useCurrentProfile();


  /* =========================================================
     STATE
     ========================================================= */

  const [
    conversation,
    setConversation,
  ] = useState(null);


  const [
    rawMessages,
    setRawMessages,
  ] = useState([]);


  const [
    loadedProfiles,
    setLoadedProfiles,
  ] = useState({});


  const [
    conversationChecked,
    setConversationChecked,
  ] = useState(false);


  /* =========================================================
     SUBSCRIBE TO CONVERSATION

     Works for:
     - DM
     - Group
     ========================================================= */

  useEffect(() => {
    if (!channel) {
      setConversation(
        null,
      );

      setConversationChecked(
        true,
      );

      return;
    }


    setConversationChecked(
      false,
    );


    const unsubscribe =
      subscribeToConversation(
        channel,

        (
          conversationData,
        ) => {
          setConversation(
            conversationData,
          );

          setConversationChecked(
            true,
          );
        },

        (
          error,
        ) => {
          console.error(
            "Unable to load conversation:",
            error,
          );


          setConversation(
            null,
          );

          setConversationChecked(
            true,
          );
        },
      );


    return unsubscribe;
  }, [
    channel,
  ]);


  /* =========================================================
     SUBSCRIBE TO MESSAGES

     Same message system for:
     - DM
     - Group
     ========================================================= */

  useEffect(() => {
    if (!channel) {
      setRawMessages(
        [],
      );

      return;
    }


    const unsubscribe =
      subscribeToMessages(
        channel,

        (
          messages,
        ) => {
          setRawMessages(
            messages,
          );
        },

        (
          error,
        ) => {
          console.error(
            "Unable to load messages:",
            error,
          );
        },
      );


    return unsubscribe;
  }, [
    channel,
  ]);


  /* =========================================================
     LOAD ALL CONVERSATION MEMBER PROFILES

     DM:
     2 profiles

     GROUP:
     every member profile
     ========================================================= */

  useEffect(() => {
    const memberIds =
      conversation
        ?.members;


    if (
      !Array.isArray(
        memberIds,
      ) ||
      memberIds.length ===
        0
    ) {
      setLoadedProfiles(
        {},
      );

      return;
    }


    let cancelled =
      false;


    async function loadProfiles() {
      try {
        const loaded =
          await getUserProfiles(
            memberIds,
          );


        if (
          cancelled
        ) {
          return;
        }


        const nextProfiles =
          {};


        for (
          const profile of loaded
        ) {
          nextProfiles[
            profile.id
          ] = profile;
        }


        setLoadedProfiles(
          nextProfiles,
        );
      } catch (error) {
        console.error(
          "Unable to load conversation member profiles:",
          error,
        );
      }
    }


    loadProfiles();


    return () => {
      cancelled =
        true;
    };
  }, [
    conversation?.members,
  ]);


  /* =========================================================
     PROFILE LOOKUP

     Always make sure our own latest profile is included.
     ========================================================= */

  const profiles =
    useMemo(
      () => {
        const nextProfiles = {
          ...loadedProfiles,
        };


        if (
          user?.uid &&
          currentProfile
        ) {
          nextProfiles[
            user.uid
          ] = {
            ...currentProfile,

            id:
              user.uid,
          };
        }


        return nextProfiles;
      },
      [
        loadedProfiles,
        currentProfile,
        user?.uid,
      ],
    );


  /* =========================================================
     BUILD AUTHOR OBJECT

     Message.jsx already knows how to display this shape.
     ========================================================= */

  function buildAuthor(
    authorId,
  ) {
    const profile =
      profiles[
        authorId
      ];


    const self =
      authorId ===
      user?.uid;


    const displayName =
      profile?.displayName ||
      profile?.username ||
      (
        self
          ? "You"
          : "Unknown User"
      );


    const username =
      profile?.username ||
      (
        self
          ? "you"
          : ""
      );


    const avatarURL =
      profile?.avatarURL ||
      "";


    const status =
      profile?.status ||
      (
        self
          ? "Online"
          : "Offline"
      );


    return {
      id:
        authorId,

      uid:
        authorId,

      username,

      displayName,

      avatarURL,

      animatedAvatarURL:
        avatarURL,

      profilePictureUrl:
        avatarURL,

      self,

      presence:
        status,

      status,

      statusText:
        status,

      title:
        profile?.title ||
        "Member",

      role:
        profile?.role ||
        "Member",

      roleName:
        profile?.role ||
        "Member",
    };
  }


  /* =========================================================
     RAW MESSAGE LOOKUP

     Used for replies.
     ========================================================= */

  const rawMessagesById =
    useMemo(
      () => {
        const lookup =
          {};


        for (
          const message of rawMessages
        ) {
          lookup[
            message.id
          ] = message;
        }


        return lookup;
      },
      [
        rawMessages,
      ],
    );


  /* =========================================================
     MAP FIRESTORE MESSAGES INTO EXISTING MESSAGE UI
     ========================================================= */

  const mappedMessages =
    useMemo(
      () =>
        rawMessages.map(
          (
            message,
          ) => {
            const author =
              buildAuthor(
                message.authorId,
              );


            const timestamp =
              timestampToMillis(
                message.createdAt,
              );


            /* ===============================================
               REPLY DATA
               =============================================== */

            const rawReply =
              message.replyToId
                ? rawMessagesById[
                    message
                      .replyToId
                  ]
                : null;


            let reply =
              null;


            if (rawReply) {
              const replyAuthor =
                buildAuthor(
                  rawReply.authorId,
                );


              const replyTimestamp =
                timestampToMillis(
                  rawReply.createdAt,
                );


              reply = {
                id:
                  rawReply.id,

                authorId:
                  rawReply.authorId,

                author:
                  replyAuthor,

                username:
                  replyAuthor.username,

                displayName:
                  replyAuthor.displayName,

                avatarURL:
                  replyAuthor.avatarURL,

                profilePictureUrl:
                  replyAuthor.avatarURL,

                content:
                  rawReply.deleted
                    ? ""
                    : rawReply.content,

                createdAt:
                  new Date(
                    replyTimestamp,
                  ),

                timestamp:
                  replyTimestamp,

                deleted:
                  Boolean(
                    rawReply.deleted,
                  ),

                pinned:
                  Boolean(
                    rawReply.pinned,
                  ),
              };
            }


            /* ===============================================
               MAIN MESSAGE
               =============================================== */

            return {
              id:
                message.id,


              /* AUTHOR */

              authorId:
                message.authorId,

              author,

              username:
                author.username,

              displayName:
                author.displayName,

              avatarURL:
                author.avatarURL,

              animatedAvatarURL:
                author.avatarURL,

              profilePictureUrl:
                author.avatarURL,


              /* CONTENT */

              content:
                message.deleted
                  ? ""
                  : message.content,


              /* TIME */

              createdAt:
                new Date(
                  timestamp,
                ),

              timestamp,


              editedAt:
                message.editedAt
                  ? new Date(
                      timestampToMillis(
                        message.editedAt,
                      ),
                    )
                  : null,


              /* REPLY */

              replyToId:
                message.replyToId ||
                null,

              replyIds:
                message.replyToId
                  ? [
                      message.replyToId,
                    ]
                  : [],

              replyTo:
                reply,

              reply,

              repliedMessage:
                reply,


              /* PIN */

              pinned:
                Boolean(
                  message.pinned,
                ),

              pinnedAt:
                message.pinnedAt ||
                null,

              pinnedBy:
                message.pinnedBy ||
                null,


              /* DELETED */

              deleted:
                Boolean(
                  message.deleted,
                ),

              deletedAt:
                message.deletedAt ||
                null,


              /* FUTURE / EXISTING UI COMPATIBILITY */

              attachments:
                message.attachments ||
                [],

              reactions:
                message.reactions ||
                [],

              mentionIds:
                message.mentionIds ||
                [],

              nonce:
                message.nonce ||
                null,


              /* FIRESTORE */

              conversationId:
                conversation
                  ?.id ||
                channel,

              channelId:
                conversation
                  ?.id ||
                channel,

              firestore:
                true,

              rawMessage:
                message,
            };
          },
        ),
      [
        rawMessages,
        rawMessagesById,
        profiles,
        user?.uid,
        conversation?.id,
        channel,
      ],
    );


  /* =========================================================
     BUILD MEMBER LIST

     This feeds your EXISTING MemberSidebar.jsx.
     ========================================================= */

  const members =
    useMemo(
      () =>
        (
          conversation
            ?.members ||
          []
        ).map(
          (
            memberId,
          ) => {
            const profile =
              profiles[
                memberId
              ];


            const self =
              memberId ===
              user?.uid;


            const displayName =
              profile?.displayName ||
              profile?.username ||
              (
                self
                  ? "You"
                  : "Unknown User"
              );


            const avatarURL =
              profile?.avatarURL ||
              "";


            const status =
              profile?.status ||
              (
                self
                  ? "Online"
                  : "Offline"
              );


            return {
              id:
                memberId,

              uid:
                memberId,

              username:
                profile?.username ||
                (
                  self
                    ? "you"
                    : ""
                ),

              displayName,

              avatarURL,

              animatedAvatarURL:
                avatarURL,

              profilePictureUrl:
                avatarURL,

              presence:
                status,

              status,

              statusText:
                status,

              title:
                profile?.title ||
                "Member",

              role:
                profile?.role ||
                "Member",

              roleName:
                profile?.role ||
                "Member",

              self,

              /*
               * Useful later when we add:
               * - kick user
               * - group settings
               * - ownership indicator
               */

              groupOwner:
                memberId ===
                conversation
                  ?.ownerId,

              owner:
                memberId ===
                conversation
                  ?.ownerId,
            };
          },
        ),
      [
        conversation,
        profiles,
        user?.uid,
      ],
    );


  /* =========================================================
     BUILD EXISTING TEXTCHANNEL OBJECT
     ========================================================= */

  const channelData =
    useMemo(
      () => {
        if (
          !conversation
        ) {
          return null;
        }


        /* ===================================================
           DIRECT MESSAGE
           =================================================== */

        if (
          conversation.type ===
          "dm"
        ) {
          const recipientId =
            getOtherDmUserId(
              conversation,
              user?.uid,
            );


          const recipient =
            members.find(
              (
                member,
              ) =>
                member.id ===
                recipientId,
            ) ||
            null;


          return {
            id:
              conversation.id,

            conversationId:
              conversation.id,

            type:
              "DirectMessage",

            name:
              recipient
                ?.displayName ||
              recipient
                ?.username ||
              "Direct Message",

            description:
              "",

            mature:
              false,

            isVoice:
              false,


            /* RECIPIENT */

            recipient,


            /* PERMISSIONS */

            canSend:
              true,

            canUpload:
              true,

            canManage:
              false,

            canInvite:
              false,

            slowmode:
              0,


            /* MEMBERS */

            members,

            typing:
              [],


            /* MESSAGES */

            messages:
              mappedMessages,


            /* FIRESTORE */

            firestore:
              true,

            rawConversation:
              conversation,
          };
        }


        /* ===================================================
           GROUP CHAT
           =================================================== */

        if (
          conversation.type ===
          "group"
        ) {
          return {
            id:
              conversation.id,

            conversationId:
              conversation.id,

            type:
              "Group",

            name:
              conversation.name ||
              "Group Chat",

            description:
              "",

            mature:
              false,

            isVoice:
              false,


            /* GROUP INFO */

            ownerId:
              conversation.ownerId,

            joinCode:
              conversation.joinCode,

            memberCount:
              members.length,


            /* PERMISSIONS */

            canSend:
              true,

            canUpload:
              true,

            canManage:
              conversation.ownerId ===
              user?.uid,

            canInvite:
              true,

            slowmode:
              0,


            /* MEMBERS

               THIS is what makes the existing
               MemberSidebar appear for groups.
            */

            members,

            typing:
              [],


            /* MESSAGES */

            messages:
              mappedMessages,


            /* FIRESTORE */

            firestore:
              true,

            rawConversation:
              conversation,
          };
        }


        return null;
      },
      [
        conversation,
        members,
        mappedMessages,
        user?.uid,
      ],
    );


  /* =========================================================
     LOADING

     Keep blank so we don't introduce a different
     loading design into your chat UI.
     ========================================================= */

  if (
    !conversationChecked
  ) {
    return (
      <div
        className="
          relative
          flex
          min-w-0
          flex-1
          flex-col
        "
      />
    );
  }


  /* =========================================================
     NOT FOUND / NO ACCESS
     ========================================================= */

  if (!channelData) {
    return (
      <Navigate
        to="/"
        replace
      />
    );
  }


  /* =========================================================
     EXISTING CHAT UI

     DM:
       TextChannel, no MemberSidebar

     GROUP:
       same TextChannel + existing MemberSidebar
     ========================================================= */

  return (
    <div
      className="
        relative
        flex
        min-w-0
        flex-1
        flex-col
      "
    >
      <TextChannel
        channel={
          channelData
        }
      />
    </div>
  );
}