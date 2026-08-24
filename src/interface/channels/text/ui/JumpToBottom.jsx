import {
  ArrowDown,
} from "lucide-react";

export function JumpToBottom({
  onClick,
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="
        flex
        w-[calc(100%-24px)]
        items-center
        gap-3
        rounded-xl
        bg-[var(--md-sys-color-primary-container)]
        px-4
        py-2
        text-xs
        font-semibold
        text-white
        shadow-lg
      "
    >
      <span className="flex-1 text-left">
        Viewing older
        messages
      </span>

      <span>
        Jump to present
      </span>

      <ArrowDown
        size={16}
      />
    </button>
  );
}