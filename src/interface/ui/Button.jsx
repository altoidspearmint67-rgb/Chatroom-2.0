import {
  Ripple,
} from "./Ripple";

function getHeight(size) {
  switch (size) {
    case "xs":
      return "h-8";

    case "md":
      return "h-14";

    case "lg":
      return "h-24";

    case "xl":
      return "h-[136px]";

    case "icon":
      return "h-9 w-9";

    case "normal":
      return "h-[38px] min-w-24";

    case "small":
      return "h-10";

    default:
      return "h-10";
  }
}

function getPadding(size) {
  switch (size) {
    case "xs":
      return "px-3";

    case "md":
      return "px-6";

    case "lg":
      return "px-12";

    case "xl":
      return "px-16";

    case "icon":
      return "px-0";

    case "normal":
      return "px-4";

    case "none":
      return "px-0";

    default:
      return "px-4";
  }
}

function getVariant(
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
    case "elevated":
      return `
        bg-[var(--md-sys-color-surface-container-low)]
        text-[var(--md-sys-color-primary)]
        shadow-sm
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

    case "text":
      return `
        bg-transparent
        text-[var(--md-sys-color-primary)]
      `;

    case "_error":
    case "error":
      return `
        bg-[var(--md-sys-color-error)]
        text-[var(--md-sys-color-on-error)]
      `;

    case "plain":
      return `
        bg-transparent
        text-[var(--md-sys-color-on-surface)]
      `;

    case "secondary":
      return `
        bg-[var(--md-sys-color-secondary-container)]
        text-[var(--md-sys-color-on-secondary-container)]
      `;

    case "filled":
    case "primary":
    default:
      return `
        bg-[var(--md-sys-color-primary)]
        text-[var(--md-sys-color-on-primary)]
      `;
  }
}

function getRadius({
  shape,
  group,
  size,
}) {
  if (
    group ===
    "connected-start"
  ) {
    return size === "md"
      ? "rounded-l-full rounded-r-xl"
      : "rounded-l-full rounded-r-lg";
  }

  if (
    group ===
    "connected-end"
  ) {
    return size === "md"
      ? "rounded-r-full rounded-l-xl"
      : "rounded-r-full rounded-l-lg";
  }

  if (
    group === "connected"
  ) {
    return "rounded-lg";
  }

  if (
    shape === "square"
  ) {
    if (
      size === "lg" ||
      size === "xl"
    ) {
      return "rounded-2xl";
    }

    if (size === "md") {
      return "rounded-xl";
    }

    return "rounded-lg";
  }

  return "rounded-full";
}

export function Button({
  children,

  size = "sm",

  shape = "round",

  variant = "filled",

  group,

  groupActive = false,

  bg,

  disabled = false,

  isDisabled,

  onPress,

  onClick,

  className = "",

  style,

  ...rest
}) {
  const actuallyDisabled =
    Boolean(
      disabled ||
      isDisabled,
    );

  const activeVariant =
    group
      ? groupActive
        ? "filled"
        : "tonal"
      : variant;

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
      style={{
        ...style,

        backgroundColor:
          bg ||
          style
            ?.backgroundColor,
      }}
      className={[
        "group relative flex shrink-0 items-center justify-center",
        "border-0 font-medium transition-all duration-150",
        "select-none",

        actuallyDisabled
          ? "cursor-not-allowed"
          : "cursor-pointer",

        getHeight(size),

        getPadding(size),

        getVariant(
          activeVariant,
          actuallyDisabled,
        ),

        getRadius({
          shape,
          group,
          size,
        }),

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