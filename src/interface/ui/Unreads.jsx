export function Unreads({
  unread = false,

  count = 0,

  size = "0.85rem",
}) {
  if (
    !unread &&
    count <= 0
  ) {
    return null;
  }

  if (count > 0) {
    return (
      <span
        className="
          grid
          shrink-0
          place-items-center
          rounded-full
          bg-[var(--md-sys-color-error)]
          font-semibold
          text-[var(--md-sys-color-on-error)]
        "
        style={{
          width: size,
          height: size,
          minWidth: size,
          fontSize: "8px",
        }}
      >
        {count < 10
          ? count
          : "+"}
      </span>
    );
  }

  return (
    <span
      className="
        shrink-0
        rounded-full
        bg-[var(--md-sys-color-on-surface)]
      "
      style={{
        width: size,
        height: size,
      }}
    />
  );
}

Unreads.Graphic =
  Unreads;