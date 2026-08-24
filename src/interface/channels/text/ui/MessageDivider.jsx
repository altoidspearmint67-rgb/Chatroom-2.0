export function MessageDivider({
  date,
  unread = false,
}) {
  return (
    <div
      className={[
        "my-[17px] ml-2 mr-3 flex h-0 select-none items-center border-t",

        unread
          ? "border-[var(--md-sys-color-primary)]"
          : "border-[var(--md-sys-color-outline-variant)]",
      ].join(" ")}
    >
      {unread && (
        <div
          className="
            -mt-px
            rounded-full
            bg-[var(--md-sys-color-primary)]
            px-1.5
            text-[10px]
            font-semibold
            text-black
          "
        >
          NEW
        </div>
      )}

      {date && (
        <time
          className="
            -mt-[2px]
            rounded-lg
            bg-[var(--md-sys-color-surface-container-low)]
            px-1.5
            text-[11px]
            font-semibold
            text-[var(--md-sys-color-outline)]
          "
        >
          {date}
        </time>
      )}
    </div>
  );
}