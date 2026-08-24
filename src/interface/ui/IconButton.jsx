import {
  Ripple,
} from "./Ripple";

function sizeClass(size) {
  switch (size) {
    case "xs":
      return "h-8";

    case "md":
      return "h-14";

    case "lg":
      return "h-24";

    case "xl":
      return "h-[136px]";

    default:
      return "h-10";
  }
}

function widthClass(
  size,
  width,
) {
  if (
    width === "narrow"
  ) {
    if (
      size === "xs" ||
      size === "sm"
    ) {
      return "px-1";
    }

    if (size === "md") {
      return "px-3";
    }

    return "px-4";
  }

  if (width === "wide") {
    if (size === "xs") {
      return "px-2.5";
    }

    if (size === "sm") {
      return "px-3.5";
    }

    if (size === "md") {
      return "px-6";
    }

    return "px-12";
  }

  if (size === "xs") {
    return "px-1.5";
  }

  if (size === "sm") {
    return "px-2";
  }

  if (size === "md") {
    return "px-4";
  }

  return "px-8";
}

function variantClass(
  variant,
  disabled,
) {
  if (disabled) {
    return `
      bg-white/[0.08]
      text-white/30
    `;
  }

  switch (variant) {
    case "filled":
      return `
        bg-[var(--md-sys-color-primary)]
        text-[var(--md-sys-color-on-primary)]
      `;

    case "tonal":
      return `
        bg-[var(--md-sys-color-secondary-container)]
        text-[var(--md-sys-color-on-secondary-container)]
      `;

    case "outlined":
      return `
        border
        border-[var(--md-sys-color-outline-variant)]
        bg-transparent
        text-[var(--md-sys-color-on-surface-variant)]
      `;

    case "_header":
      return `
        bg-transparent
        text-white
      `;

    case "standard":
    default:
      return `
        bg-transparent
        text-[var(--md-sys-color-on-surface-variant)]
      `;
  }
}

export function IconButton({
  children,

  size = "sm",

  shape = "round",

  width = "default",

  variant = "standard",

  _compositionSendMessage = false,

  disabled = false,

  isDisabled,

  onPress,

  onClick,

  className = "",

  ...rest
}) {
  const actuallyDisabled =
    Boolean(
      disabled ||
      isDisabled,
    );

  return (
    <button
      {...rest}
      type={
        rest.type ||
        "button"
      }
      disabled={
        actuallyDisabled
      }
      onClick={(event) => {
        if (
          actuallyDisabled
        ) {
          return;
        }

        onClick?.(event);

        onPress?.(event);
      }}
      className={[
        "group relative flex shrink-0 items-center justify-center",
        "font-medium transition-all duration-150",

        _compositionSendMessage
          ? "h-full w-12 rounded-r-2xl"
          : `${sizeClass(
              size,
            )} aspect-square ${widthClass(
              size,
              width,
            )}`,

        shape === "square"
          ? size === "md"
            ? "rounded-xl"
            : "rounded-lg"
          : "rounded-full",

        variantClass(
          variant,
          actuallyDisabled,
        ),

        actuallyDisabled
          ? "cursor-not-allowed"
          : "cursor-pointer",

        className,
      ].join(" ")}
    >
      {!actuallyDisabled && (
        <Ripple />
      )}

      {children}
    </button>
  );
}