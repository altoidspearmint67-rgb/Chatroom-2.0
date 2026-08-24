export function ConversationStart({
  channel,
}) {
  return (
    <div
      className="
        mx-4
        mb-2
        mt-[18px]
        flex
        select-none
        flex-col
        text-[var(--md-sys-color-on-surface)]
      "
    >
      {channel.type !==
        "SavedMessages" && (
        <div
          className="
            text-3xl
            font-bold
            text-white
          "
        >
          {channel.name ||
            channel.recipient
              ?.username}
        </div>
      )}

      <div
        className="
          mt-1
          text-lg
          font-semibold
          text-white/70
        "
      >
        {channel.type ===
        "SavedMessages"
          ? "This is the start of your notes."
          : "This is the start of your conversation."}
      </div>
    </div>
  );
}