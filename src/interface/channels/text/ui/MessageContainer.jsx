import {
  MessageToolbar,
} from "./MessageToolbar";

function formatTime(value) {
  const date =
    value instanceof Date
      ? value
      : new Date(value);

  return date.toLocaleTimeString(
    [],
    {
      hour: "numeric",
      minute: "2-digit",
    },
  );
}

function formatCalendar(value) {
  const date =
    value instanceof Date
      ? value
      : new Date(value);

  return date.toLocaleString(
    [],
    {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    },
  );
}

export function MessageContainer({
  id,

  avatar,

  pronouns,

  username,

  children,

  header,

  info,

  timestamp,

  edited,

  mentioned = false,

  highlight = false,

  editing = false,

  sendStatus = "sent",

  tail = false,

  compact = false,

  isLink = false,

  onHover,

  toolbar = true,
}) {
  return (
    <div
      id={id}
      onMouseEnter={() =>
        onHover?.(true)
      }
      onMouseLeave={() =>
        onHover?.(false)
      }
      className={[
        "group relative flex min-h-[1em] flex-col rounded-lg py-[2px]",
        "transition-colors",

        isLink
          ? "cursor-pointer select-none"
          : "hover:bg-[var(--md-sys-color-surface-container)]",

        mentioned
          ? "bg-[var(--md-sys-color-primary-container)]"
          : "",

        highlight
          ? "animate-[highlight-message_3s_ease]"
          : "",

        sendStatus ===
        "failed"
          ? "text-[var(--md-sys-color-error)]"
          : "",

        sendStatus ===
        "sending"
          ? "text-[var(--md-sys-color-outline)]"
          : "",
      ].join(" ")}
    >
      {toolbar &&
        !isLink &&
        !editing && (
          <MessageToolbar />
        )}

      {header}

      <div className="flex">
        <div
          className={[
            "flex shrink-0 justify-end",

            tail
              ? "p-0"
              : "px-1 py-[2px]",

            compact
              ? ""
              : "w-[54px]",
          ].join(" ")}
        >
          {compact ? (
            <div
              className="
                flex
                h-fit
                shrink-0
                items-center
                gap-1
                px-3
              "
            >
              <span className="text-[11px] text-white/35">
                {formatTime(
                  timestamp,
                )}
              </span>

              {username}
            </div>
          ) : tail ? (
            <div
              title={formatCalendar(
                timestamp,
              )}
              className="
                w-full
                pr-1
                pt-[3px]
                text-right
                text-[10px]
                text-white/25
                opacity-0
                transition-opacity
                group-hover:opacity-100
              "
            >
              {edited
                ? "(edited)"
                : formatTime(
                    timestamp,
                  )}
            </div>
          ) : (
            avatar
          )}
        </div>

        <div
          className={[
            "flex min-w-0 flex-1 flex-col overflow-hidden pr-3",

            editing
              ? "overflow-visible"
              : "",
          ].join(" ")}
        >
          {!tail &&
            !compact && (
              <div
                className="
                  flex
                  min-w-0
                  items-center
                  gap-1.5
                "
              >
                <div className="min-w-0 truncate">
                  {username}
                </div>

                {info && (
                  <div
                    className="
                      flex
                      shrink-0
                      items-center
                      gap-1
                      text-xs
                      text-white/35
                    "
                  >
                    {info}
                  </div>
                )}

                {pronouns && (
                  <div className="truncate text-xs text-white/35">
                    {pronouns} ·
                  </div>
                )}

                <div
                  title={formatCalendar(
                    timestamp,
                  )}
                  className="
                    shrink-0
                    text-[11px]
                    text-white/30
                  "
                >
                  {formatCalendar(
                    timestamp,
                  )}

                  {edited && (
                    <span>
                      {" "}
                      (edited)
                    </span>
                  )}
                </div>
              </div>
            )}

          <div
            className="
              flex
              min-w-0
              flex-col
              gap-1
              text-sm
            "
          >
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}