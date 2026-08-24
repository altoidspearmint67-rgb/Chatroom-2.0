import {
  AtSign,
  XCircle,
} from "lucide-react";

import {
  MessageReply,
} from "./MessageReply";

export function MessageReplyPreview({
  message,

  mention,

  self,

  toggle,

  dismiss,
}) {
  return (
    <div
      className="
        mb-2
        flex
        select-none
        items-center
        gap-2
        rounded-xl
        bg-[var(--md-sys-color-primary-container)]
        px-3
        py-2
        text-xs
        text-[var(--md-sys-color-on-primary-container)]
      "
    >
      <span className="shrink-0">
        Replying to
      </span>

      <MessageReply
        message={message}
        noDecorations
      />

      <div className="ml-auto flex shrink-0 items-center gap-3">
        {!self && (
          <button
            type="button"
            onClick={toggle}
            className={[
              "flex items-center gap-1 uppercase",

              mention
                ? "text-white"
                : "text-white/40",
            ].join(" ")}
          >
            <AtSign
              size={15}
            />

            {mention
              ? "On"
              : "Off"}
          </button>
        )}

        <button
          type="button"
          onClick={dismiss}
        >
          <XCircle
            size={16}
          />
        </button>
      </div>
    </div>
  );
}