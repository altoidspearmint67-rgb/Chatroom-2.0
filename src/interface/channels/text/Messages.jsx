import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  useAuth,
} from "../../../auth/AuthContext";

import {
  deleteMessage as deleteFirestoreMessage,
  editMessage as editFirestoreMessage,
  toggleMessagePin as toggleFirestoreMessagePin,
} from "../../../firebase/conversations";

import {
  Message,
} from "./Message";

import {
  useMessageCache,
} from "./MessageCache";

import {
  BlockedMessage,
  ConversationStart,
  JumpToBottom,
  MessageDivider,
} from "./ui";


const GROUP_TIME =
  7 * 60 * 1000;


function getCreatedAt(
  message,
) {
  if (
    message.createdAt
  ) {
    return new Date(
      message.createdAt,
    );
  }


  if (
    message.timestamp
  ) {
    return new Date(
      message.timestamp,
    );
  }


  return new Date();
}


function getAuthorId(
  message,
) {
  if (
    message.author &&
    typeof message.author ===
      "object"
  ) {
    return (
      message.author.id ||
      message.author
        .username
    );
  }


  return (
    message.authorId ||
    message.author ||
    message.username ||
    "unknown"
  );
}


function sameDay(
  a,
  b,
) {
  return (
    a.getFullYear() ===
      b.getFullYear() &&
    a.getMonth() ===
      b.getMonth() &&
    a.getDate() ===
      b.getDate()
  );
}


function formatDate(
  date,
) {
  return date.toLocaleDateString(
    [],
    {
      month:
        "long",

      day:
        "numeric",

      year:
        "numeric",
    },
  );
}


function isBlocked(
  message,
) {
  return (
    message.author
      ?.relationship ===
    "Blocked"
  );
}


export function Messages({
  channel,

  messages = [],

  onMessagesChange,

  highlightedMessageId,

  lastReadId,

  clearHighlightedMessage,

  pendingMessages,

  jumpToBottomRef,

  atEnd,

  onReply,
}) {
  const {
    user,
  } = useAuth();


  const cache =
    useMessageCache();


  const listRef =
    useRef(null);


  const messagesRef =
    useRef(messages);


  const atEndRef =
    useRef(true);


  const [
    editingMessageId,
    setEditingMessageId,
  ] = useState(null);


  const externalAtEnd =
    atEnd?.[0];


  const setExternalAtEnd =
    atEnd?.[1];


  const [
    internalAtEnd,
    setInternalAtEnd,
  ] = useState(true);


  const currentAtEnd =
    externalAtEnd ??
    internalAtEnd;


  /*
   * Deleted Firestore messages remain in the database
   * as soft-deleted records, but completely disappear
   * from the visible chat.
   */

  const visibleMessages =
    useMemo(
      () =>
        messages.filter(
          (message) =>
            !message.deleted,
        ),
      [
        messages,
      ],
    );


  useEffect(() => {
    messagesRef.current =
      messages;
  }, [
    messages,
  ]);


  useEffect(() => {
    atEndRef.current =
      currentAtEnd;
  }, [
    currentAtEnd,
  ]);


  function setAtEnd(
    value,
  ) {
    atEndRef.current =
      value;


    setInternalAtEnd(
      value,
    );


    setExternalAtEnd?.(
      value,
    );
  }


  function jumpToBottom(
    smooth = true,
  ) {
    const container =
      listRef.current;


    if (!container) {
      return;
    }


    container.scrollTo({
      top:
        container.scrollHeight,

      behavior:
        smooth
          ? "smooth"
          : "auto",
    });


    setAtEnd(true);


    if (
      highlightedMessageId
    ) {
      clearHighlightedMessage?.();
    }
  }


  useEffect(() => {
    if (
      channel.firestore
    ) {
      requestAnimationFrame(
        () => {
          jumpToBottom(
            false,
          );
        },
      );


      return;
    }


    const cached =
      cache?.unmanage(
        channel.id,
      );


    if (
      cached?.messages
        ?.length
    ) {
      onMessagesChange?.(
        cached.messages,
      );


      requestAnimationFrame(
        () => {
          const container =
            listRef.current;


          if (!container) {
            return;
          }


          if (
            typeof cached.scrollTop ===
            "number"
          ) {
            container.scrollTop =
              cached.scrollTop;
          } else {
            container.scrollTop =
              container.scrollHeight;
          }


          setAtEnd(
            cached.atEnd ??
              true,
          );
        },
      );
    } else {
      requestAnimationFrame(
        () => {
          jumpToBottom(
            false,
          );
        },
      );
    }


    return () => {
      cache?.manage(
        channel.id,
        {
          messages:
            messagesRef.current,

          atStart:
            true,

          atEnd:
            atEndRef.current,

          scrollTop:
            listRef.current
              ?.scrollTop,
        },
      );
    };


    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    channel.id,
  ]);


  useEffect(() => {
    jumpToBottomRef?.(
      jumpToBottom,
    );
  });


  useEffect(() => {
    if (
      !highlightedMessageId
    ) {
      return;
    }


    const element =
      document.getElementById(
        highlightedMessageId,
      );


    if (!element) {
      return;
    }


    element.scrollIntoView({
      behavior:
        "smooth",

      block:
        "center",
    });


    setAtEnd(false);
  }, [
    highlightedMessageId,
    visibleMessages,
  ]);


  function onScroll() {
    const container =
      listRef.current;


    if (!container) {
      return;
    }


    const distanceFromBottom =
      container.scrollHeight -
      container.scrollTop -
      container.clientHeight;


    setAtEnd(
      distanceFromBottom <
        80,
    );
  }


  /* =========================================================
     EDIT MESSAGE
     ========================================================= */

  async function saveEdit(
    id,
    content,
  ) {
    const cleanContent =
      String(
        content ||
        "",
      ).trim();


    if (!cleanContent) {
      return;
    }


    if (
      channel.firestore
    ) {
      try {
        await editFirestoreMessage({
          conversationId:
            channel.conversationId ||
            channel.id,

          messageId:
            id,

          content:
            cleanContent,
        });


        setEditingMessageId(
          null,
        );
      } catch (error) {
        console.error(
          "Unable to edit message:",
          error,
        );


        window.alert(
          error?.message ||
          "Unable to edit message.",
        );
      }


      return;
    }


    const nextMessages =
      messages.map(
        (message) =>
          message.id === id
            ? {
                ...message,

                content:
                  cleanContent,

                editedAt:
                  new Date(),
              }
            : message,
      );


    onMessagesChange?.(
      nextMessages,
    );


    setEditingMessageId(
      null,
    );
  }


  /* =========================================================
     DELETE MESSAGE
     ========================================================= */

  async function deleteMessage(
    id,
  ) {
    const message =
      messages.find(
        (item) =>
          item.id === id,
      );


    if (!message) {
      return;
    }


    const shouldDelete =
      window.confirm(
        "Delete this message?",
      );


    if (!shouldDelete) {
      return;
    }


    if (
      channel.firestore
    ) {
      try {
        await deleteFirestoreMessage({
          conversationId:
            channel.conversationId ||
            channel.id,

          messageId:
            id,
        });


        if (
          editingMessageId ===
          id
        ) {
          setEditingMessageId(
            null,
          );
        }
      } catch (error) {
        console.error(
          "Unable to delete message:",
          error,
        );


        window.alert(
          error?.message ||
          "Unable to delete message.",
        );
      }


      return;
    }


    onMessagesChange?.(
      messages.filter(
        (item) =>
          item.id !== id,
      ),
    );


    if (
      editingMessageId ===
      id
    ) {
      setEditingMessageId(
        null,
      );
    }
  }


  /* =========================================================
     PIN / UNPIN
     ========================================================= */

  async function togglePin(
    message,
  ) {
    if (!message?.id) {
      return;
    }


    if (
      channel.firestore
    ) {
      if (!user?.uid) {
        return;
      }


      try {
        await toggleFirestoreMessagePin({
          conversationId:
            channel.conversationId ||
            channel.id,

          messageId:
            message.id,

          userId:
            user.uid,

          currentlyPinned:
            Boolean(
              message.pinned,
            ),
        });
      } catch (error) {
        console.error(
          "Unable to update message pin:",
          error,
        );


        window.alert(
          error?.message ||
          "Unable to update message pin.",
        );
      }


      return;
    }


    onMessagesChange?.(
      messages.map(
        (item) =>
          item.id ===
          message.id
            ? {
                ...item,

                pinned:
                  !item.pinned,
              }
            : item,
      ),
    );
  }


  /* =========================================================
     BUILD VISIBLE MESSAGE LIST
     ========================================================= */

  const entries =
    useMemo(() => {
      const result =
        [];


      let previousMessage =
        null;


      let previousDate =
        null;


      let blockedCount =
        0;


      let unreadInserted =
        false;


      const lastReadIndex =
        lastReadId
          ? visibleMessages.findIndex(
              (message) =>
                message.id ===
                lastReadId,
            )
          : -1;


      function flushBlocked() {
        if (
          blockedCount ===
          0
        ) {
          return;
        }


        result.push({
          type:
            "blocked",

          id:
            `blocked-${result.length}`,

          count:
            blockedCount,
        });


        blockedCount =
          0;
      }


      visibleMessages.forEach(
        (
          message,
          index,
        ) => {
          const createdAt =
            getCreatedAt(
              message,
            );


          if (
            !previousDate ||
            !sameDay(
              previousDate,
              createdAt,
            )
          ) {
            flushBlocked();


            result.push({
              type:
                "date",

              id:
                `date-${createdAt.toISOString()}-${index}`,

              date:
                createdAt,
            });


            previousDate =
              createdAt;
          }


          if (
            !unreadInserted &&
            lastReadIndex >=
              0 &&
            index ===
              lastReadIndex +
                1
          ) {
            flushBlocked();


            result.push({
              type:
                "unread",

              id:
                "unread-divider",
            });


            unreadInserted =
              true;


            previousMessage =
              null;
          }


          if (
            isBlocked(
              message,
            )
          ) {
            blockedCount +=
              1;


            previousMessage =
              null;


            return;
          }


          flushBlocked();


          let tail =
            false;


          if (
            previousMessage
          ) {
            const previousCreatedAt =
              getCreatedAt(
                previousMessage,
              );


            const sameAuthor =
              getAuthorId(
                previousMessage,
              ) ===
              getAuthorId(
                message,
              );


            const closeEnough =
              Math.abs(
                +createdAt -
                  +previousCreatedAt,
              ) <
              GROUP_TIME;


            const differentMasquerade =
              JSON.stringify(
                previousMessage
                  .masquerade ||
                  null,
              ) !==
              JSON.stringify(
                message.masquerade ||
                  null,
              );


            const currentHasReplies =
              Boolean(
                message.replyIds
                  ?.length ||
                message.replies
                  ?.length ||
                message.replyTo,
              );


            const systemMessage =
              Boolean(
                message.systemMessage ||
                previousMessage
                  .systemMessage,
              );


            tail =
              sameAuthor &&
              closeEnough &&
              !differentMasquerade &&
              !currentHasReplies &&
              !systemMessage;
          }


          result.push({
            type:
              "message",

            id:
              message.id,

            message,

            tail,
          });


          previousMessage =
            message;
        },
      );


      flushBlocked();


      return result;
    }, [
      visibleMessages,
      lastReadId,
    ]);


  const pendingIsTrailing =
    useMemo(() => {
      const lastMessage =
        visibleMessages[
          visibleMessages.length -
            1
        ];


      if (!lastMessage) {
        return false;
      }


      const authorId =
        getAuthorId(
          lastMessage,
        );


      const authoredByUs =
        lastMessage.author
          ?.self ||
        authorId ===
          "You" ||
        authorId ===
          "current-user" ||
        authorId ===
          user?.uid;


      const recent =
        Math.abs(
          Date.now() -
            +getCreatedAt(
              lastMessage,
            ),
        ) <
        GROUP_TIME;


      return (
        authoredByUs &&
        recent
      );
    }, [
      visibleMessages,
      user?.uid,
    ]);


  const sentIds =
    useMemo(
      () =>
        visibleMessages
          .map(
            (message) =>
              message.nonce,
          )
          .filter(
            Boolean,
          ),
      [
        visibleMessages,
      ],
    );


  return (
    <>
      <div
        ref={
          listRef
        }
        onScroll={
          onScroll
        }
        className="
          min-h-0
          flex-1
          overflow-y-auto
          overflow-x-hidden
          [scrollbar-width:thin]
        "
      >
        <ConversationStart
          channel={
            channel
          }
        />


        {entries.map(
          (
            entry,
          ) => {
            if (
              entry.type ===
              "date"
            ) {
              return (
                <MessageDivider
                  key={
                    entry.id
                  }
                  date={
                    formatDate(
                      entry.date,
                    )
                  }
                />
              );
            }


            if (
              entry.type ===
              "unread"
            ) {
              return (
                <MessageDivider
                  key={
                    entry.id
                  }
                  unread
                />
              );
            }


            if (
              entry.type ===
              "blocked"
            ) {
              return (
                <BlockedMessage
                  key={
                    entry.id
                  }
                  count={
                    entry.count
                  }
                />
              );
            }


            return (
              <Message
                key={
                  entry.id
                }
                message={
                  entry.message
                }
                tail={
                  entry.tail
                }
                highlight={
                  entry.message
                    .id ===
                  highlightedMessageId
                }
                editing={
                  entry.message
                    .id ===
                  editingMessageId
                }
                onStartEdit={
                  setEditingMessageId
                }
                onCancelEdit={() =>
                  setEditingMessageId(
                    null,
                  )
                }
                onSaveEdit={
                  saveEdit
                }
                onDelete={
                  deleteMessage
                }
                onReply={
                  onReply
                }
                onTogglePin={
                  togglePin
                }
              />
            );
          },
        )}


        {pendingMessages?.({
          tail:
            pendingIsTrailing,

          ids:
            sentIds,
        })}


        <div className="h-4" />
      </div>


      {!currentAtEnd && (
        <div
          className="
            relative
            z-30
            h-0
          "
        >
          <div
            className="
              absolute
              bottom-3
              left-3
              right-3
            "
          >
            <JumpToBottom
              onClick={() =>
                jumpToBottom(
                  true,
                )
              }
            />
          </div>
        </div>
      )}
    </>
  );
}