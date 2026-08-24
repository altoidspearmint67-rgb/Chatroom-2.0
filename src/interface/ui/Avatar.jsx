import {
  useState,
} from "react";

import {
  Ripple,
} from "./Ripple";

function initials(input) {
  if (!input) {
    return "?";
  }

  const parts = String(input)
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (parts.length === 1) {
    return parts[0]
      .slice(0, 2)
      .toUpperCase();
  }

  return (
    parts[0][0] +
    parts[
      parts.length - 1
    ][0]
  ).toUpperCase();
}

export function Avatar({
  size = 32,

  shape = "circle",

  src,

  fallback,

  primaryContrast = false,

  holepunch = "none",

  overlay,

  interactive = false,

  onClick,

  slot,
}) {
  const [
    failed,
    setFailed,
  ] = useState(false);

  const shapeClass =
    shape === "square"
      ? "rounded-none"
      : shape ===
          "rounded-square"
        ? "rounded-lg"
        : "rounded-full";

  const showImage =
    Boolean(src) &&
    !failed;

  return (
    <div
      slot={slot}
      onClick={onClick}
      data-holepunch={
        holepunch || "none"
      }
      className={[
        "group relative shrink-0 select-none",
        shapeClass,

        interactive
          ? "cursor-pointer"
          : "",
      ].join(" ")}
      style={{
        width: size,
        height: size,
      }}
    >
      <div
        className={[
          "relative h-full w-full overflow-hidden",
          shapeClass,
        ].join(" ")}
      >
        {interactive && (
          <Ripple />
        )}

        {showImage ? (
          <img
            src={src}
            alt=""
            draggable={false}
            onError={() =>
              setFailed(true)
            }
            className="
              h-full
              w-full
              object-cover
              transition
              duration-150
            "
          />
        ) : (
          <div
            className={[
              "flex h-full w-full items-center justify-center",
              "text-xs font-semibold",

              primaryContrast
                ? "bg-[var(--md-sys-color-primary)] text-[var(--md-sys-color-on-primary)]"
                : "bg-[var(--md-sys-color-surface-container-low)] text-[var(--md-sys-color-on-surface)]",
            ].join(" ")}
          >
            {typeof fallback ===
            "string"
              ? initials(
                  fallback,
                )
              : fallback}
          </div>
        )}
      </div>

      {overlay}
    </div>
  );
}