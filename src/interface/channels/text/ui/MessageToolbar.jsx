import {
  EllipsisVertical,
  Pencil,
  Reply,
  Smile,
  Trash2,
} from "lucide-react";

import {
  useMessage,
} from "./MessageContext";

function Tool({
  title,
  onClick,
  children,
  danger = false,
}) {
  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      className={[
        "relative grid h-8 w-8 place-items-center transition",

        danger
          ? "text-red-300/60 hover:bg-red-500/10 hover:text-red-300"
          : "text-white/55 hover:bg-white/10 hover:text-white",
      ].join(" ")}
    >
      {children}
    </button>
  );
}

export function MessageToolbar() {
  const context =
    useMessage();

  if (!context) {
    return null;
  }

  const {
    message,
    canReply = true,
    canReact = true,
    canDelete = false,
    onReply,
    onReact,
    onEdit,
    onDelete,
    onMore,
  } = context;

  const self =
    message?.author?.self ||
    message?.author === "You";

  return (
    <div
      className="
        Toolbar
        absolute
        -top-[18px]
        right-4
        z-20
        hidden
        items-center
        overflow-hidden
        rounded-lg
        border
        border-white/5
        bg-[var(--md-sys-color-secondary-container)]
        shadow-lg
        group-hover:flex
      "
    >
      {canReply && (
        <Tool
          title="Reply"
          onClick={() =>
            onReply?.(
              message,
            )
          }
        >
          <Reply size={17} />
        </Tool>
      )}

      {canReact && (
        <Tool
          title="Add reaction"
          onClick={() =>
            onReact?.(
              message,
              "👍",
            )
          }
        >
          <Smile size={17} />
        </Tool>
      )}

      {self && (
        <Tool
          title="Edit message"
          onClick={() =>
            onEdit?.(
              message,
            )
          }
        >
          <Pencil size={17} />
        </Tool>
      )}

      {(self ||
        canDelete) && (
        <Tool
          title="Delete message"
          danger
          onClick={(event) =>
            onDelete?.(
              message,
              event.shiftKey,
            )
          }
        >
          <Trash2 size={17} />
        </Tool>
      )}

      <Tool
        title="More"
        onClick={() =>
          onMore?.(
            message,
          )
        }
      >
        <EllipsisVertical
          size={17}
        />
      </Tool>
    </div>
  );
}