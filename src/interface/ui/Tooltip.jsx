function positionClass(
  placement,
) {
  switch (placement) {
    case "bottom":
      return `
        left-1/2
        top-full
        mt-2
        -translate-x-1/2
      `;

    case "left":
      return `
        right-full
        top-1/2
        mr-2
        -translate-y-1/2
      `;

    case "right":
      return `
        left-full
        top-1/2
        ml-2
        -translate-y-1/2
      `;

    case "top-start":
      return `
        bottom-full
        left-0
        mb-2
      `;

    case "top":
    default:
      return `
        bottom-full
        left-1/2
        mb-2
        -translate-x-1/2
      `;
  }
}

export function Tooltip({
  children,

  content,

  placement = "top",

  className = "",
}) {
  const value =
    typeof content ===
    "function"
      ? content()
      : content;

  return (
    <span
      className={[
        "group/tooltip relative inline-flex",
        className,
      ].join(" ")}
    >
      {children}

      <span
        role="tooltip"
        className={[
          "pointer-events-none absolute z-[200]",
          "hidden whitespace-nowrap rounded-lg bg-black px-2 py-1.5",
          "text-[11px] font-medium text-white shadow-xl",
          "group-hover/tooltip:block",

          positionClass(
            placement,
          ),
        ].join(" ")}
      >
        {value}
      </span>
    </span>
  );
}