import {
  X,
} from "lucide-react";

export function BlockedMessage({
  count,
}) {
  return (
    <div
      className="
        relative
        mt-2
        flex
        items-center
        gap-1
        rounded-lg
        px-6
        py-1
        text-[0.8em]
        text-[var(--md-sys-color-outline)]
      "
    >
      <X size={15} />

      {count} blocked{" "}
      {count === 1
        ? "message"
        : "messages"}
    </div>
  );
}