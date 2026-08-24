function presenceColor(
  status,
) {
  switch (
    status?.toLowerCase()
  ) {
    case "online":
      return "bg-emerald-500";

    case "idle":
      return "bg-amber-400";

    case "busy":
      return "bg-red-500";

    case "focus":
      return "bg-violet-500";

    case "invisible":
    case "offline":
    default:
      return "bg-zinc-500";
  }
}

function UserStatusGraphic({
  status,
  size = "10px",
}) {
  return (
    <span
      className={[
        "block rounded-full",
        presenceColor(
          status,
        ),
      ].join(" ")}
      style={{
        width: size,
        height: size,
      }}
    />
  );
}

export function UserStatus({
  status = "Invisible",

  size = "10px",
}) {
  return (
    <UserStatusGraphic
      status={status}
      size={size}
    />
  );
}

UserStatus.Graphic =
  UserStatusGraphic;