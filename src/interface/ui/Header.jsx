export function Header({
  children,

  placement = "primary",

  topBorder = false,

  bottomBorder = false,

  image = false,

  transparent = false,

  backgroundImage,

  className = "",

  style,

  ...rest
}) {
  return (
    <div
      {...rest}
      style={{
        ...style,

        backgroundImage:
          backgroundImage
            ? `url("${backgroundImage}")`
            : style
                ?.backgroundImage,
      }}
      className={[
        "flex shrink-0 select-none items-center overflow-hidden",
        "gap-2.5 rounded-xl px-4 font-semibold",
        "text-[var(--md-sys-color-on-surface)]",
        "h-12",

        placement ===
        "primary"
          ? "mb-2 mr-2 mt-2"
          : "m-2 bg-[var(--md-sys-color-surface-variant)]",

        image
          ? "h-[120px] items-end bg-cover bg-center p-0 text-white"
          : "",

        transparent
          ? "z-10 w-[calc(100%-var(--gap-md))]"
          : "",

        topBorder
          ? "border-t border-[var(--md-sys-color-outline-variant)]"
          : "",

        bottomBorder
          ? "border-b border-[var(--md-sys-color-outline-variant)]"
          : "",

        className,
      ].join(" ")}
    >
      {children}
    </div>
  );
}

export function BelowFloatingHeader({
  children,
}) {
  return (
    <div className="relative z-10">
      {children}
    </div>
  );
}