import {
  File,
} from "lucide-react";

function AuthorAvatar({
  message,
}) {
  const name =
    message?.author
      ?.displayName ||
    message?.author
      ?.username ||
    message?.author ||
    "?";

  if (
    message?.avatarURL
  ) {
    return (
      <img
        src={
          message.avatarURL
        }
        alt=""
        className="h-3.5 w-3.5 rounded-full object-cover"
      />
    );
  }

  return (
    <div
      className="
        grid
        h-3.5
        w-3.5
        place-items-center
        rounded-full
        bg-white/10
        text-[6px]
      "
    >
      {name
        .slice(0, 1)
        .toUpperCase()}
    </div>
  );
}

export function MessageReply({
  message,

  mention = false,

  noDecorations = false,

  onClick,
}) {
  if (!message) {
    return (
      <div
        className="
          flex
          min-w-0
          items-center
          gap-1
          text-xs
          text-white/40
        "
      >
        Message not loaded,
        click to jump
      </div>
    );
  }

  if (
    message.author
      ?.relationship ===
    "Blocked"
  ) {
    return (
      <div className="text-xs text-white/40">
        Blocked User
      </div>
    );
  }

  const username =
    message.author
      ?.displayName ||
    message.author
      ?.username ||
    message.author ||
    "Unknown";

  const content =
    (
      message.content ||
      ""
    )
      .replace(/\n/g, " ")
      .slice(0, 128);

  return (
    <button
      type="button"
      onClick={onClick}
      className="
        flex
        min-w-0
        flex-1
        items-center
        gap-2
        overflow-hidden
        text-left
        text-xs
        text-white/55
      "
    >
      {!noDecorations && (
        <span
          className="
            ml-[30px]
            h-3
            w-[22px]
            shrink-0
            self-end
            rounded-tl
            border-l-2
            border-t-2
            border-[var(--md-sys-color-outline-variant)]
          "
        />
      )}

      <span className="flex shrink-0 items-center gap-1">
        <AuthorAvatar
          message={
            message
          }
        />

        <span className="font-semibold text-white/65">
          {mention
            ? "@"
            : ""}
          {username}
        </span>
      </span>

      {message.attachments
        ?.length > 0 && (
        <span className="flex shrink-0 items-center gap-1 italic">
          <File size={13} />

          {message
            .attachments
            .length > 1
            ? "Sent multiple attachments"
            : "Sent an attachment"}
        </span>
      )}

      {content && (
        <span className="min-w-0 truncate">
          {content}
        </span>
      )}
    </button>
  );
}