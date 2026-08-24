import {
  X,
} from "lucide-react";

export function NewMessages({
  lastId,
  jumpBack,
  dismiss,
}) {
  if (!lastId) {
    return null;
  }

  return (
    <button
      type="button"
      onClick={jumpBack}
      className="
        flex
        w-full
        items-center
        gap-3
        rounded-xl
        bg-[var(--md-sys-color-primary-container)]
        px-4
        py-2
        text-xs
        text-white
      "
    >
      <span className="flex-1 text-left">
        New messages
      </span>

      <span>
        Jump to the
        beginning
      </span>

      <span
        role="button"
        tabIndex={0}
        onClick={(
          event,
        ) => {
          event.stopPropagation();

          dismiss?.();
        }}
        className="grid h-5 w-5 place-items-center rounded hover:bg-white/10"
      >
        <X size={15} />
      </span>
    </button>
  );
}