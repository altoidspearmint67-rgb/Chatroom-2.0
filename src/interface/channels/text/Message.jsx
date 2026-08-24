import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  BellOff,
  Bot,
  Cloud,
  CornerLeftDown,
  Link2,
  Pencil,
  Pin,
  PinOff,
  ShieldAlert,
  Smile,
  Trash2,
} from "lucide-react";

import {
  EditMessage,
} from "./EditMessage";


const MessageContext =
  createContext(null);


export function useMessage() {
  return useContext(
    MessageContext,
  );
}


function getAuthor(
  message,
) {
  if (
    message.author &&
    typeof message.author ===
      "object"
  ) {
    return message.author;
  }


  if (
    typeof message.author ===
    "string"
  ) {
    return {
      id:
        message.authorId ||
        message.author,

      username:
        message.author,

      displayName:
        message.author,

      self:
        message.author ===
        "You",
    };
  }


  return {
    id:
      message.authorId ||
      "unknown",

    username:
      message.username ||
      "Unknown",

    displayName:
      message.displayName ||
      message.username ||
      "Unknown",
  };
}


function getCreatedAt(
  message,
) {
  if (message.createdAt) {
    return new Date(
      message.createdAt,
    );
  }


  if (message.timestamp) {
    return new Date(
      message.timestamp,
    );
  }


  return new Date();
}


function Avatar({
  author,
  src,
}) {
  const name =
    author.displayName ||
    author.username ||
    "?";


  if (src) {
    return (
      <img
        src={src}
        alt=""
        className="
          h-9
          w-9
          rounded-full
          object-cover
        "
      />
    );
  }


  return (
    <div
      className="
        grid
        h-9
        w-9
        place-items-center
        rounded-full
        bg-white/8
        text-xs
        font-bold
        text-white
      "
    >
      {name
        .slice(0, 2)
        .toUpperCase()}
    </div>
  );
}


function MessageBadge({
  message,
}) {
  if (
    message.author
      ?.privileged
  ) {
    return (
      <span title="Official Communication">
        <ShieldAlert
          size={14}
        />
      </span>
    );
  }


  if (
    message.author?.bot
  ) {
    return (
      <span title="Bot">
        <Bot size={14} />
      </span>
    );
  }


  if (message.webhook) {
    return (
      <span title="Webhook">
        <Cloud size={14} />
      </span>
    );
  }


  if (
    message.isSuppressed
  ) {
    return (
      <span title="Silent">
        <BellOff
          size={14}
        />
      </span>
    );
  }


  if (
    message.masquerade
  ) {
    return (
      <span title="Message from another platform">
        <Link2
          size={14}
        />
      </span>
    );
  }


  return null;
}


function AttachmentPreview({
  attachment,
}) {
  const [
    objectUrl,
    setObjectUrl,
  ] = useState(null);


  const isFile =
    typeof File !==
      "undefined" &&
    attachment instanceof
      File;


  useEffect(() => {
    if (!isFile) {
      return;
    }


    const url =
      URL.createObjectURL(
        attachment,
      );


    setObjectUrl(url);


    return () =>
      URL.revokeObjectURL(
        url,
      );
  }, [
    attachment,
    isFile,
  ]);


  const name =
    isFile
      ? attachment.name
      : attachment.name ||
        attachment.filename ||
        "Attachment";


  const type =
    isFile
      ? attachment.type
      : attachment.type ||
        "";


  const url =
    objectUrl ||
    attachment.url ||
    attachment.src;


  if (
    url &&
    type.startsWith(
      "image/",
    )
  ) {
    return (
      <div className="mt-2">
        <img
          src={url}
          alt={name}
          className="
            max-h-[360px]
            max-w-[520px]
            rounded-xl
            object-contain
          "
        />
      </div>
    );
  }


  return (
    <div
      className="
        mt-2
        flex
        max-w-[420px]
        items-center
        gap-3
        rounded-xl
        bg-white/5
        px-4
        py-3
        text-sm
        text-white/70
      "
    >
      📎

      <span className="truncate">
        {name}
      </span>
    </div>
  );
}


function Embed({
  embed,
}) {
  return (
    <div
      className="
        mt-2
        max-w-[520px]
        rounded-xl
        border-l-4
        border-[var(--md-sys-color-primary)]
        bg-white/5
        p-4
      "
    >
      {embed.title && (
        <div className="font-semibold text-white">
          {embed.title}
        </div>
      )}


      {embed.description && (
        <div className="mt-1 text-sm text-white/60">
          {
            embed.description
          }
        </div>
      )}


      {embed.image && (
        <img
          src={
            embed.image
          }
          alt=""
          className="mt-3 max-h-[300px] rounded-lg object-cover"
        />
      )}
    </div>
  );
}


/* =========================================================
   REPLY PREVIEW
   ========================================================= */

function ReplyPreview({
  reply,
}) {
  const replyAuthor =
    reply?.author;


  const authorName =
    typeof replyAuthor ===
      "string"
      ? replyAuthor
      : replyAuthor
          ?.displayName ||
        replyAuthor
          ?.username ||
        reply?.displayName ||
        reply?.username ||
        "Unknown";


  return (
    <div
      className="
        ml-[52px]
        flex
        max-w-[620px]
        items-center
        gap-2
        pb-1
        text-xs
        text-white/40
      "
    >
      <CornerLeftDown
        size={13}
      />


      <span className="font-semibold text-white/55">
        {authorName}
      </span>


      <span className="truncate">
        {reply?.deleted
          ? "Message deleted"
          : reply?.content ||
            "Original message"}
      </span>
    </div>
  );
}


function normalizeReactions(
  input,
) {
  if (!input) {
    return [];
  }


  if (
    Array.isArray(input)
  ) {
    return input;
  }


  if (
    input instanceof Map
  ) {
    return Array.from(
      input.entries(),
    ).map(
      ([
        emoji,
        users,
      ]) => ({
        emoji,

        count:
          users?.size ||
          0,

        me:
          false,
      }),
    );
  }


  return Object.entries(
    input,
  ).map(
    ([
      emoji,
      value,
    ]) => {
      if (
        typeof value ===
        "number"
      ) {
        return {
          emoji,

          count:
            value,

          me:
            false,
        };
      }


      return {
        emoji,

        count:
          value.count ||
          0,

        me:
          Boolean(
            value.me,
          ),
      };
    },
  );
}


export function Message({
  message,

  tail = false,

  highlight = false,

  editing = false,

  onStartEdit,

  onCancelEdit,

  onSaveEdit,

  onDelete,

  onReply,

  onTogglePin,
}) {
  const author =
    getAuthor(
      message,
    );


  const createdAt =
    getCreatedAt(
      message,
    );


  const [
    reactions,
    setReactions,
  ] = useState(() =>
    normalizeReactions(
      message.reactions,
    ),
  );


  useEffect(() => {
    setReactions(
      normalizeReactions(
        message.reactions,
      ),
    );
  }, [
    message.reactions,
  ]);


  const avatar =
    message.animatedAvatarURL ||
    message.avatarURL ||
    message.profilePictureUrl ||
    author.avatarURL ||
    author.profilePictureUrl;


  const replies =
    message.replies?.length
      ? message.replies
      : message.replyTo
        ? [
            message.replyTo,
          ]
        : [];


  function react(
    emoji,
  ) {
    setReactions(
      (current) => {
        const found =
          current.find(
            (entry) =>
              entry.emoji ===
              emoji,
          );


        if (!found) {
          return [
            ...current,

            {
              emoji,

              count: 1,

              me: true,
            },
          ];
        }


        return current.map(
          (entry) =>
            entry.emoji ===
            emoji
              ? {
                  ...entry,

                  me:
                    !entry.me,

                  count:
                    entry.me
                      ? Math.max(
                          0,
                          entry.count -
                            1,
                        )
                      : entry.count +
                        1,
                }
              : entry,
        );
      },
    );
  }


  const contextValue =
    useMemo(
      () => ({
        message,
        react,
      }),
      [
        message,
      ],
    );


  return (
    <MessageContext.Provider
      value={
        contextValue
      }
    >
      <div
        id={
          message.id
        }
        className={[
          "group relative py-0.5 transition",

          highlight
            ? "bg-[var(--md-sys-color-primary-container)]/35"
            : "hover:bg-white/[0.025]",

          editing
            ? "bg-white/[0.035]"
            : "",
        ].join(" ")}
      >
        {replies.map(
          (
            reply,
          ) => (
            <ReplyPreview
              key={
                reply.id ||
                `${message.id}-reply`
              }
              reply={
                reply
              }
            />
          ),
        )}


        <div
          className="
            relative
            flex
            min-w-0
            gap-3
            px-4
          "
        >
          <div
            className="
              flex
              w-9
              shrink-0
              justify-center
            "
          >
            {!tail ? (
              <Avatar
                author={
                  author
                }
                src={
                  avatar
                }
              />
            ) : (
              <span
                className="
                  hidden
                  pt-1
                  text-[10px]
                  text-white/25
                  group-hover:block
                "
              >
                {createdAt.toLocaleTimeString(
                  [],
                  {
                    hour:
                      "numeric",

                    minute:
                      "2-digit",
                  },
                )}
              </span>
            )}
          </div>


          <div
            className="
              min-w-0
              flex-1
              pb-1
            "
          >
            {!tail && (
              <div
                className="
                  flex
                  min-w-0
                  items-center
                  gap-2
                "
              >
                <span
                  className="
                    truncate
                    text-sm
                    font-semibold
                    text-white
                  "
                >
                  {message
                    .masquerade
                    ?.name ||
                    message
                      .member
                      ?.nickname ||
                    author.displayName ||
                    author.username}
                </span>


                <MessageBadge
                  message={
                    message
                  }
                />


                {author.pronouns && (
                  <span className="text-[11px] text-white/35">
                    {
                      author.pronouns
                    }
                  </span>
                )}


                <span className="text-[11px] text-white/30">
                  {createdAt.toLocaleString(
                    [],
                    {
                      month:
                        "short",

                      day:
                        "numeric",

                      hour:
                        "numeric",

                      minute:
                        "2-digit",
                    },
                  )}
                </span>


                {message.editedAt && (
                  <span className="text-[10px] text-white/25">
                    edited
                  </span>
                )}
              </div>
            )}


            {message.systemMessage && (
              <div className="text-sm italic text-white/50">
                {
                  message.systemMessage
                }
              </div>
            )}


            {editing ? (
              <EditMessage
                message={
                  message
                }
                onSave={(
                  content,
                ) =>
                  onSaveEdit?.(
                    message.id,
                    content,
                  )
                }
                onCancel={
                  onCancelEdit
                }
              />
            ) : (
              message.content && (
                <div
                  className="
                    break-words
                    whitespace-pre-wrap
                    text-sm
                    leading-5
                    text-white/75
                  "
                >
                  {
                    message.content
                  }
                </div>
              )
            )}


            {message.attachments?.map(
              (
                attachment,
                index,
              ) => (
                <AttachmentPreview
                  key={
                    attachment.id ||
                    attachment.name ||
                    index
                  }
                  attachment={
                    attachment
                  }
                />
              ),
            )}


            {message.embeds?.map(
              (
                embed,
                index,
              ) => (
                <Embed
                  key={
                    embed.id ||
                    embed.url ||
                    index
                  }
                  embed={
                    embed
                  }
                />
              ),
            )}


            {reactions.length >
              0 && (
              <div
                className="
                  mt-2
                  flex
                  flex-wrap
                  gap-1
                "
              >
                {reactions.map(
                  (
                    reaction,
                  ) => (
                    <button
                      key={
                        reaction.emoji
                      }
                      type="button"
                      onClick={() =>
                        react(
                          reaction.emoji,
                        )
                      }
                      className={[
                        "flex h-7 items-center gap-1 rounded-lg border px-2 text-xs transition",

                        reaction.me
                          ? "border-[var(--md-sys-color-primary)] bg-[var(--md-sys-color-primary-container)] text-white"
                          : "border-white/5 bg-white/5 text-white/65 hover:bg-white/8",
                      ].join(
                        " ",
                      )}
                    >
                      <span>
                        {
                          reaction.emoji
                        }
                      </span>

                      <span>
                        {
                          reaction.count
                        }
                      </span>
                    </button>
                  ),
                )}
              </div>
            )}
          </div>


          {!editing && (
            <div
              className="
                absolute
                -top-4
                right-4
                hidden
                items-center
                rounded-lg
                border
                border-white/5
                bg-[var(--md-sys-color-surface-container-highest)]
                p-1
                shadow-lg
                group-hover:flex
              "
            >
              <button
                type="button"
                title="Add reaction"
                onClick={() =>
                  react("👍")
                }
                className="rounded p-1.5 text-white/45 hover:bg-white/7 hover:text-white"
              >
                <Smile
                  size={16}
                />
              </button>


              <button
                type="button"
                title="Reply"
                onClick={() =>
                  onReply?.(
                    message,
                  )
                }
                className="rounded p-1.5 text-white/45 hover:bg-white/7 hover:text-white"
              >
                <CornerLeftDown
                  size={16}
                />
              </button>


              <button
                type="button"
                title={
                  message.pinned
                    ? "Unpin message"
                    : "Pin message"
                }
                onClick={() =>
                  onTogglePin?.(
                    message,
                  )
                }
                className="rounded p-1.5 text-white/45 hover:bg-white/7 hover:text-white"
              >
                {message.pinned ? (
                  <PinOff
                    size={16}
                  />
                ) : (
                  <Pin
                    size={16}
                  />
                )}
              </button>


              {author.self && (
                <button
                  type="button"
                  title="Edit message"
                  onClick={() =>
                    onStartEdit?.(
                      message.id,
                    )
                  }
                  className="rounded p-1.5 text-white/45 hover:bg-white/7 hover:text-white"
                >
                  <Pencil
                    size={16}
                  />
                </button>
              )}


              {author.self && (
                <button
                  type="button"
                  title="Delete message"
                  onClick={() =>
                    onDelete?.(
                      message.id,
                    )
                  }
                  className="rounded p-1.5 text-red-300/60 hover:bg-red-500/10 hover:text-red-300"
                >
                  <Trash2
                    size={16}
                  />
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </MessageContext.Provider>
  );
}