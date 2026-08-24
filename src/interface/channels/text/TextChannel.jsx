import {
  useEffect,
  useRef,
  useState,
} from "react";

import {
  useSearchParams,
} from "react-router-dom";

import {
  useAuth,
} from "../../../auth/AuthContext";

import {
  sendMessage as sendFirestoreMessage,
} from "../../../firebase/conversations";

import {
  ChannelHeader,
} from "../ChannelHeader";

import {
  AddGroupMembersModal,
} from "./AddGroupMembersModal";

import {
  GroupSettingsModal,
} from "./GroupSettingsModal";

import {
  MessageComposition,
} from "./Composition";

import {
  CompositionInfo,
} from "./CompositionInfo";

import {
  DraftMessages,
} from "./DraftMessages";

import {
  MemberSidebar,
} from "./MemberSidebar";

import {
  Messages,
} from "./Messages";

import {
  TextSearchSidebar,
} from "./TextSearchSidebar";


/* =========================================================
   MEMBER SIDEBAR RULE
   ========================================================= */

export function canIHasSidebar(
  channel,
) {
  return ![
    "SavedMessages",
    "DirectMessage",
  ].includes(
    channel.type,
  );
}


/* =========================================================
   TEXT CHANNEL
   ========================================================= */

export function TextChannel({
  channel,
}) {
  const {
    user,
  } = useAuth();


  const [
    messages,
    setMessages,
  ] = useState(
    channel.messages ||
      [],
  );


  const [
    pendingMessages,
    setPendingMessages,
  ] = useState([]);


  const [
    replyingTo,
    setReplyingTo,
  ] = useState(null);


  const [
    sidebarState,
    setSidebarState,
  ] = useState({
    state:
      "default",
  });


  const [
    memberSidebarOpen,
    setMemberSidebarOpen,
  ] = useState(
    canIHasSidebar(
      channel,
    ),
  );


  const [
    atEnd,
    setAtEnd,
  ] = useState(true);


  /* =========================================================
     GROUP MODALS
     ========================================================= */

  const [
    groupSettingsOpen,
    setGroupSettingsOpen,
  ] = useState(false);


  const [
    addGroupMembersOpen,
    setAddGroupMembersOpen,
  ] = useState(false);


  const [
    searchParams,
    setSearchParams,
  ] = useSearchParams();


  const jumpToBottomRef =
    useRef(null);


  const highlightedMessageId =
    searchParams.get(
      "message",
    ) ||
    undefined;


  const lastReadId =
    channel.lastReadId;


  /* =========================================================
     CHANNEL CHANGE
     ========================================================= */

  useEffect(() => {
    setMessages(
      channel.messages ||
        [],
    );


    setPendingMessages(
      [],
    );


    setReplyingTo(
      null,
    );


    setSidebarState({
      state:
        "default",
    });


    setMemberSidebarOpen(
      canIHasSidebar(
        channel,
      ),
    );


    setAtEnd(
      true,
    );


    setGroupSettingsOpen(
      false,
    );


    setAddGroupMembersOpen(
      false,
    );
  }, [
    channel.id,
  ]);


  /* =========================================================
     REALTIME FIRESTORE
     ========================================================= */

  useEffect(() => {
    if (
      !channel.firestore
    ) {
      return;
    }


    setMessages(
      channel.messages ||
        [],
    );
  }, [
    channel.firestore,
    channel.messages,
  ]);


  /* =========================================================
     HIGHLIGHT
     ========================================================= */

  function clearHighlightedMessage() {
    const next =
      new URLSearchParams(
        searchParams,
      );


    next.delete(
      "message",
    );


    setSearchParams(
      next,
      {
        replace:
          true,
      },
    );
  }


  /* =========================================================
     SEND
     ========================================================= */

  async function sendMessage(
    content,
    files = [],
    replyData,
  ) {
    const cleanContent =
      content.trim();


    if (
      !cleanContent &&
      files.length ===
        0
    ) {
      return;
    }


    if (
      channel.firestore
    ) {
      if (
        !user?.uid
      ) {
        return;
      }


      if (
        files.length >
          0 &&
        !cleanContent
      ) {
        return;
      }


      const draftId =
        crypto.randomUUID?.() ||
        `draft-${Date.now()}`;


      const draft = {
        id:
          draftId,

        idempotencyKey:
          draftId,

        status:
          "sending",

        content:
          cleanContent,

        files:
          [],

        createdAt:
          Date.now(),
      };


      setPendingMessages(
        (
          current,
        ) => [
          ...current,
          draft,
        ],
      );


      jumpToBottomRef
        .current?.();


      try {
        await sendFirestoreMessage({
          conversationId:
            channel.conversationId ||
            channel.id,

          authorId:
            user.uid,

          content:
            cleanContent,

          replyToId:
            replyData
              ?.message
              ?.id ||
            null,
        });


        setPendingMessages(
          (
            current,
          ) =>
            current.filter(
              (
                item,
              ) =>
                item.id !==
                draftId,
            ),
        );


        setReplyingTo(
          null,
        );


        window.setTimeout(
          () =>
            jumpToBottomRef
              .current?.(),
          1,
        );
      } catch (error) {
        console.error(
          "Unable to send message:",
          error,
        );


        setPendingMessages(
          (
            current,
          ) =>
            current.map(
              (
                item,
              ) =>
                item.id ===
                draftId
                  ? {
                      ...item,

                      status:
                        "failed",
                    }
                  : item,
            ),
        );
      }


      return;
    }


    /* =====================================================
       LOCAL FALLBACK
       ===================================================== */

    const messageId =
      crypto.randomUUID?.() ||
      `message-${Date.now()}`;


    setMessages(
      (
        current,
      ) => [
        ...current,

        {
          id:
            messageId,

          authorId:
            "current-user",

          author: {
            id:
              "current-user",

            username:
              "you",

            displayName:
              "You",

            self:
              true,

            presence:
              "Online",
          },

          content:
            cleanContent,

          attachments:
            files,

          createdAt:
            new Date(),

          timestamp:
            Date.now(),

          pinned:
            false,

          reactions:
            [],
        },
      ],
    );
  }


  /* =========================================================
     DRAFTS
     ========================================================= */

  function retryDraft(
    draft,
  ) {
    setPendingMessages(
      (
        current,
      ) =>
        current.filter(
          (
            item,
          ) =>
            item.id !==
            draft.id,
        ),
    );


    sendMessage(
      draft.content,
      draft.files,
    );
  }


  function discardDraft(
    draft,
  ) {
    setPendingMessages(
      (
        current,
      ) =>
        current.filter(
          (
            item,
          ) =>
            item.id !==
            draft.id,
        ),
    );
  }


  /* =========================================================
     REPLY
     ========================================================= */

  function replyToMessage(
    message,
  ) {
    setReplyingTo(
      message,
    );
  }


  function cancelReply() {
    setReplyingTo(
      null,
    );
  }


  /* =========================================================
     SIDEBAR
     ========================================================= */

  const showSidebar =
    (
      memberSidebarOpen &&
      canIHasSidebar(
        channel,
      )
    ) ||
    sidebarState.state !==
      "default";


  function toggleMembers() {
    if (
      sidebarState.state !==
      "default"
    ) {
      setSidebarState({
        state:
          "default",
      });


      setMemberSidebarOpen(
        true,
      );


      return;
    }


    setMemberSidebarOpen(
      (
        current,
      ) =>
        !current,
    );
  }


  /* =========================================================
     ESCAPE / SHORTCUTS
     ========================================================= */

  useEffect(() => {
    function onKeyDown(
      event,
    ) {
      if (
        event.key ===
          "Escape" &&
        sidebarState.state !==
          "default"
      ) {
        setSidebarState({
          state:
            "default",
        });
      }


      if (
        event.key ===
          "Escape" &&
        replyingTo
      ) {
        setReplyingTo(
          null,
        );
      }


      if (
        event.key ===
          "End" &&
        (
          event.ctrlKey ||
          event.metaKey
        )
      ) {
        jumpToBottomRef
          .current?.();
      }
    }


    window.addEventListener(
      "keydown",
      onKeyDown,
    );


    return () =>
      window.removeEventListener(
        "keydown",
        onKeyDown,
      );
  }, [
    sidebarState.state,
    replyingTo,
  ]);


  /* =========================================================
     UI
     ========================================================= */

  return (
    <>
      <header
        className="
          flex
          h-14
          shrink-0
          border-b
          border-white/5
        "
      >
        <ChannelHeader
          channel={
            channel
          }
          sidebarState={
            sidebarState
          }
          setSidebarState={
            setSidebarState
          }
          memberSidebarOpen={
            memberSidebarOpen
          }
          onToggleMembers={
            toggleMembers
          }
          onOpenGroupSettings={() =>
            setGroupSettingsOpen(
              true,
            )
          }
          onAddGroupMembers={() =>
            setAddGroupMembersOpen(
              true,
            )
          }
        />
      </header>


      <div
        className="
          flex
          min-h-0
          min-w-0
          flex-1
          flex-row
        "
      >
        <main
          className="
            flex
            min-h-0
            min-w-0
            flex-1
            flex-col
          "
        >
          <Messages
            channel={
              channel
            }
            messages={
              messages
            }
            onMessagesChange={
              setMessages
            }
            highlightedMessageId={
              highlightedMessageId
            }
            lastReadId={
              lastReadId
            }
            clearHighlightedMessage={
              clearHighlightedMessage
            }
            jumpToBottomRef={(
              fn,
            ) => {
              jumpToBottomRef.current =
                fn;
            }}
            atEnd={[
              atEnd,
              setAtEnd,
            ]}
            onReply={
              replyToMessage
            }
            pendingMessages={({
              tail,
              ids,
            }) => (
              <DraftMessages
                drafts={
                  pendingMessages
                }
                tail={
                  tail
                }
                sentIds={
                  ids
                }
                onRetry={
                  retryDraft
                }
                onDiscard={
                  discardDraft
                }
              />
            )}
          />


          <CompositionInfo
            channel={
              channel
            }
          />


          <MessageComposition
            channel={
              channel
            }
            onMessageSend={
              sendMessage
            }
            replyingTo={
              replyingTo
            }
            onCancelReply={
              cancelReply
            }
          />
        </main>


        {showSidebar && (
          <aside
            className={[
              "shrink-0 overflow-y-auto border-l border-white/5",

              sidebarState.state !==
              "default"
                ? "w-[360px]"
                : "w-[var(--layout-width-channel-sidebar)]",
            ].join(
              " ",
            )}
          >
            {sidebarState.state ===
              "search" && (
              <div
                className="
                  w-[360px]
                  pr-[var(--gap-md)]
                "
              >
                <div
                  className="
                    p-[var(--gap-md)]
                    text-sm
                    font-semibold
                    text-white
                  "
                >
                  Search Results
                </div>


                <TextSearchSidebar
                  channel={
                    channel
                  }
                  messages={
                    messages
                  }
                  query={{
                    query:
                      sidebarState.query,
                  }}
                />
              </div>
            )}


            {sidebarState.state ===
              "pins" && (
              <div
                className="
                  w-[360px]
                  pr-[var(--gap-md)]
                "
              >
                <div
                  className="
                    p-[var(--gap-md)]
                    text-sm
                    font-semibold
                    text-white
                  "
                >
                  Pinned Messages
                </div>


                <TextSearchSidebar
                  channel={
                    channel
                  }
                  messages={
                    messages
                  }
                  query={{
                    pinned:
                      true,

                    sort:
                      "Latest",
                  }}
                />
              </div>
            )}


            {sidebarState.state ===
              "default" && (
              <MemberSidebar
                channel={
                  channel
                }
              />
            )}
          </aside>
        )}
      </div>


      {/* ===================================================
          GROUP SETTINGS
          =================================================== */}

      {channel.type ===
        "Group" && (
        <>
          <GroupSettingsModal
            open={
              groupSettingsOpen
            }
            channel={
              channel
            }
            onClose={() =>
              setGroupSettingsOpen(
                false,
              )
            }
            onAddPeople={() =>
              setAddGroupMembersOpen(
                true,
              )
            }
          />


          <AddGroupMembersModal
            open={
              addGroupMembersOpen
            }
            channel={
              channel
            }
            onClose={() =>
              setAddGroupMembersOpen(
                false,
              )
            }
          />
        </>
      )}
    </>
  );
}