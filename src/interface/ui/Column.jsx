const gapMap = {
  xs: "gap-[var(--gap-xs)]",
  s: "gap-[var(--gap-s)]",
  sm: "gap-[var(--gap-sm)]",
  md: "gap-[var(--gap-md)]",
  lg: "gap-[var(--gap-lg)]",
  xl: "gap-[var(--gap-xl)]",
  none: "gap-0",
};

export function Column({
  children,

  grow = false,

  group = false,

  align = false,

  justify = false,

  gap = "md",

  className = "",

  ...rest
}) {
  return (
    <div
      {...rest}
      className={[
        "m-0 flex flex-col",

        grow
          ? "flex-1"
          : "",

        group
          ? "my-4"
          : "",

        align === true
          ? "items-center"
          : align ===
              "stretch"
            ? "items-stretch"
            : "",

        justify === true
          ? "justify-center"
          : justify ===
              "stretch"
            ? "justify-stretch"
            : "",

        gapMap[gap] ||
          gapMap.md,

        className,
      ].join(" ")}
    >
      {children}
    </div>
  );
}