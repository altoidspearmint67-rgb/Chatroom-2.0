import {
  Ban,
} from "lucide-react";

export function MessageBox({
  content,

  setContent,

  onSendMessage,

  onTyping,

  onEditLastMessage,

  actionsStart,

  actionsEnd,

  actionsAppend,

  hasActionsAppend = false,

  placeholder,

  sendingAllowed = true,
}) {
  function onKeyDown(
    event,
  ) {
    if (
      event.key ===
        "Enter" &&
      !event.shiftKey
    ) {
      event.preventDefault();

      onSendMessage?.();

      return;
    }

    if (
      event.key ===
        "ArrowUp" &&
      !content
    ) {
      onEditLastMessage?.();
    }
  }

  return (
    <div
      className="
        mb-2
        flex
        max-h-[var(--layout-height-message-box,220px)]
        shrink-0
        gap-2
      "
    >
      <div
        className={[
          "flex min-w-0 flex-1 items-end bg-[var(--md-sys-color-surface-container-high)] px-2 py-1",

          hasActionsAppend
            ? "rounded-l-xl rounded-r-md"
            : "rounded-xl",
        ].join(" ")}
      >
        {sendingAllowed ? (
          actionsStart
        ) : (
          <div className="grid h-10 w-10 shrink-0 place-items-center">
            <Ban size={21} />
          </div>
        )}

        {sendingAllowed ? (
          <>
            <textarea
              value={content}
              placeholder={
                placeholder
              }
              rows={1}
              onChange={(
                event,
              ) => {
                setContent?.(
                  event.target
                    .value,
                );

                onTyping?.();
              }}
              onKeyDown={
                onKeyDown
              }
              className="
                max-h-40
                min-h-10
                min-w-0
                flex-1
                resize-none
                bg-transparent
                px-2
                py-2.5
                text-sm
                text-white
                outline-none
                placeholder:text-white/30
              "
            />

            {actionsEnd}
          </>
        ) : (
          <div
            className="
              flex
              min-h-10
              flex-1
              items-center
              p-2
              text-sm
              text-white/45
            "
          >
            You don't have
            permission to send
            messages in this
            channel.
          </div>
        )}
      </div>

      {sendingAllowed &&
        actionsAppend}
    </div>
  );
}