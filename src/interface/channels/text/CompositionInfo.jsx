import {
  useEffect,
  useState,
} from "react";

import {
  Clock3,
} from "lucide-react";

function Avatar({
  user,
  index,
}) {
  return (
    <div
      className="
        grid
        h-[15px]
        w-[15px]
        place-items-center
        rounded-full
        border
        border-[#191a1e]
        bg-white/15
        text-[6px]
        font-bold
        text-white
      "
      style={{
        marginLeft:
          index > 0
            ? "-6px"
            : 0,
      }}
    >
      {user.username
        ?.slice(0, 1)
        .toUpperCase()}
    </div>
  );
}

function formatTime(
  totalSeconds,
) {
  const minutes =
    Math.floor(
      totalSeconds / 60,
    );

  const seconds =
    totalSeconds % 60;

  return `${String(
    minutes,
  ).padStart(
    2,
    "0",
  )}:${String(
    seconds,
  ).padStart(
    2,
    "0",
  )}`;
}

export function CompositionInfo({
  channel,
}) {
  const typingUsers =
    channel.typing || [];

  const [
    cooldown,
    setCooldown,
  ] = useState(
    channel.slowmodeRemaining ||
      0,
  );

  useEffect(() => {
    setCooldown(
      channel.slowmodeRemaining ||
        0,
    );
  }, [
    channel.id,
    channel.slowmodeRemaining,
  ]);

  useEffect(() => {
    if (
      cooldown <= 0
    ) {
      return;
    }

    const timer =
      window.setInterval(
        () =>
          setCooldown(
            (current) =>
              Math.max(
                0,
                current - 1,
              ),
          ),
        1000,
      );

    return () =>
      window.clearInterval(
        timer,
      );
  }, [cooldown > 0]);

  let typingText = "";

  if (
    typingUsers.length ===
    1
  ) {
    typingText =
      `${typingUsers[0].username} is typing…`;
  } else if (
    typingUsers.length <
      5 &&
    typingUsers.length > 1
  ) {
    const names =
      typingUsers.map(
        (user) =>
          user.username,
      );

    typingText =
      `${names
        .slice(0, -1)
        .join(", ")} and ${
        names[
          names.length -
            1
        ]
      } are typing…`;
  } else if (
    typingUsers.length >= 5
  ) {
    typingText =
      "Several people are typing…";
  }

  return (
    <div
      className="
        flex
        min-h-[26px]
        w-full
        select-none
        items-center
        gap-2
        px-3
        text-xs
        text-white/55
      "
    >
      {typingUsers.length >
        0 && (
        <>
          <div className="flex shrink-0">
            {typingUsers.map(
              (
                user,
                index,
              ) => (
                <Avatar
                  key={
                    user.id ||
                    user.username
                  }
                  user={user}
                  index={
                    index
                  }
                />
              ),
            )}
          </div>

          <span className="truncate">
            {typingText}
          </span>
        </>
      )}

      {channel.slowmode >
        0 && (
        <div
          title={`Members can send one message every ${channel.slowmode} seconds.`}
          className="
            ml-auto
            flex
            shrink-0
            items-center
            gap-1
            text-white/35
          "
        >
          <Clock3
            size={14}
          />

          <span className="font-semibold">
            {channel.bypassSlowmode
              ? "Slowmode Immune"
              : cooldown > 0
                ? formatTime(
                    cooldown,
                  )
                : "Slowmode is enabled."}
          </span>
        </div>
      )}
    </div>
  );
}