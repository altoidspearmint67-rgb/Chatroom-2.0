import {
  Plus,
} from "lucide-react";

function normalize(
  reactions,
) {
  if (!reactions) {
    return [];
  }

  if (
    Array.isArray(
      reactions,
    )
  ) {
    return reactions;
  }

  if (
    reactions instanceof
    Map
  ) {
    return Array.from(
      reactions.entries(),
    ).map(
      ([emoji, users]) => ({
        emoji,

        users:
          Array.from(
            users || [],
          ),
      }),
    );
  }

  return Object.entries(
    reactions,
  ).map(
    ([emoji, value]) => ({
      emoji,

      users:
        value.users ||
        [],

      count:
        value.count,
    }),
  );
}

export function Reactions({
  reactions,

  userId,

  required = [],

  addReaction,

  removeReaction,

  onAdd,
}) {
  const entries =
    normalize(reactions);

  const map =
    new Map(
      entries.map(
        (entry) => [
          entry.emoji,
          entry,
        ],
      ),
    );

  const requiredEntries =
    required.map(
      (emoji) =>
        map.get(emoji) || {
          emoji,
          users: [],
        },
    );

  const optionalEntries =
    entries.filter(
      (entry) =>
        !required.includes(
          entry.emoji,
        ),
    );

  if (
    requiredEntries.length ===
      0 &&
    optionalEntries.length ===
      0
  ) {
    return null;
  }

  return (
    <div
      className="
        group/reactions
        flex
        w-full
        flex-wrap
        items-center
        gap-1
      "
    >
      {requiredEntries.map(
        (entry) => (
          <Reaction
            key={
              entry.emoji
            }
            entry={entry}
            userId={
              userId
            }
            addReaction={
              addReaction
            }
            removeReaction={
              removeReaction
            }
          />
        ),
      )}

      {requiredEntries.length >
        0 &&
        optionalEntries.length >
          0 && (
          <div
            className="
              h-3.5
              w-px
              bg-[var(--md-sys-color-outline-variant)]
            "
          />
        )}

      {optionalEntries.map(
        (entry) => (
          <Reaction
            key={
              entry.emoji
            }
            entry={entry}
            userId={
              userId
            }
            addReaction={
              addReaction
            }
            removeReaction={
              removeReaction
            }
          />
        ),
      )}

      <button
        type="button"
        title="Add reaction"
        onClick={onAdd}
        className="
          grid
          h-[33px]
          w-[33px]
          place-items-center
          rounded-lg
          bg-white/5
          text-white/45
          opacity-0
          transition-opacity
          hover:bg-white/8
          hover:text-white
          group-hover/reactions:opacity-100
        "
      >
        <Plus size={15} />
      </button>
    </div>
  );
}

function Reaction({
  entry,
  userId,
  addReaction,
  removeReaction,
}) {
  const users =
    entry.users || [];

  const count =
    entry.count ??
    users.length;

  const active =
    userId
      ? users.includes(
          userId,
        )
      : Boolean(
          entry.me,
        );

  return (
    <button
      type="button"
      title={
        count
          ? `${count} reacted`
          : "No reactions yet"
      }
      onClick={() =>
        active
          ? removeReaction?.(
              entry.emoji,
            )
          : addReaction?.(
              entry.emoji,
            )
      }
      className={[
        "flex items-center gap-2 rounded-lg px-2 py-1.5 text-xs font-semibold transition",

        active
          ? "bg-[var(--md-sys-color-secondary-container)] text-white"
          : "bg-[var(--md-sys-color-surface-container-low)] text-white/70 hover:bg-white/8",
      ].join(" ")}
    >
      <span>
        {entry.emoji}
      </span>

      <span>{count}</span>
    </button>
  );
}