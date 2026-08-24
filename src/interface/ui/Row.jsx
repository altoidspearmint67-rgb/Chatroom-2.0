const gapMap = {
  xs: "gap-[var(--gap-xs)]",
  sm: "gap-[var(--gap-sm)]",
  md: "gap-[var(--gap-md)]",
  lg: "gap-[var(--gap-lg)]",
  xl: "gap-[var(--gap-xl)]",
  none: "gap-0",
};

export function Row({
  children,

  grow = false,

  wrap = false,

  align = false,

  justify = false,

  gap = "md",

  minWidth,

  className = "",

  ...rest
}) {
  return (
    <div
      {...rest}
      className={[
        "flex flex-row",

        grow
          ? "flex-1"
          : "",

        wrap
          ? "flex-wrap"
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
            ? "[&>*]:flex-1"
            : "",

        minWidth === 0
          ? "min-w-0"
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