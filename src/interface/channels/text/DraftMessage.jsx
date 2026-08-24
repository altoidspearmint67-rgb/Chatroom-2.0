function Avatar() {
  return (
    <div
      className="
        grid
        h-9
        w-9
        place-items-center
        rounded-full
        bg-[var(--md-sys-color-primary-container)]
        text-xs
        font-bold
        text-white
      "
    >
      YO
    </div>
  );
}

export function DraftMessage({
  draft,
  tail = false,
  onRetry,
  onDiscard,
}) {
  const failed =
    draft.status ===
      "failed";

  return (
    <div
      className="
        flex
        gap-3
        px-4
        py-1
        opacity-70
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
        {!tail && (
          <Avatar />
        )}
      </div>

      <div className="min-w-0 flex-1">
        {!tail && (
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-white">
              You
            </span>

            <span
              className={[
                "text-[11px]",

                failed
                  ? "text-red-400"
                  : "text-white/30",
              ].join(" ")}
            >
              {draft.status ===
              "sending"
                ? "Sending..."
                : draft.status ===
                    "failed"
                  ? "Failed to send"
                  : "Unsent message"}
            </span>
          </div>
        )}

        {draft.content && (
          <div
            className="
              whitespace-pre-wrap
              break-words
              text-sm
              leading-5
              text-white/65
            "
          >
            {draft.content}
          </div>
        )}

        {draft.files?.map(
          (
            file,
            index,
          ) => (
            <div
              key={`${file.name}-${index}`}
              className="mt-1 text-xs text-white/40"
            >
              Uploading file `
              {file.name}`...
            </div>
          ),
        )}

        {failed && (
          <div className="mt-1 flex gap-2 text-xs">
            <button
              type="button"
              onClick={() =>
                onRetry?.(
                  draft,
                )
              }
              className="font-semibold text-[var(--md-sys-color-primary)]"
            >
              Retry
            </button>

            <button
              type="button"
              onClick={() =>
                onDiscard?.(
                  draft,
                )
              }
              className="text-white/40 hover:text-white"
            >
              Discard
            </button>
          </div>
        )}
      </div>
    </div>
  );
}