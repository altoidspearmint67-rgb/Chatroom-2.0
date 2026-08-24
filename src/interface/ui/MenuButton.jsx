import {
  Link,
} from "react-router-dom";

import {
  Ripple,
} from "./Ripple";

import {
  Unreads,
} from "./Unreads";

function attentionClass(
  attention,
) {
  switch (attention) {
    case "muted":
      return `
        bg-transparent
        text-[var(--md-sys-color-outline-variant)]
        [&_img]:opacity-30
      `;

    case "active":
      return `
        bg-transparent
        text-[var(--md-sys-color-on-surface)]
      `;

    case "selected":
      return `
        bg-[var(--md-sys-color-primary-container)]
        text-[var(--md-sys-color-on-primary-container)]
      `;

    case "normal":
    default:
      return `
        bg-transparent
        text-[var(--md-sys-color-outline)]
      `;
  }
}

export function MenuButton({
  size = "normal",

  attention = "normal",

  icon,

  children,

  alert,

  actions,

  noDrawer,

  href,

  onClick,

  className = "",

  ...rest
}) {
  void noDrawer;

  const content = (
    <>
      <Ripple />

      {icon}

      <div
        className="
          min-w-0
          flex-1
        "
      >
        {children}
      </div>

      {alert && (
        <span className="hover-hide group-hover:hidden">
          <Unreads
            count={
              typeof alert ===
              "number"
                ? alert
                : 0
            }
            unread
            size={
              typeof alert ===
              "number"
                ? "0.85rem"
                : "0.4rem"
            }
          />
        </span>
      )}

      {actions && (
        <div
          onClick={(event) =>
            event.stopPropagation()
          }
          className="
            hidden
            items-center
            gap-1
            group-hover:flex
          "
        >
          {actions}
        </div>
      )}
    </>
  );

  const classes = [
    "group relative mx-2 flex shrink-0 select-none items-center",
    "rounded-2xl px-2 text-[15px] font-medium transition",

    size === "thin"
      ? "h-8 gap-1"
      : "h-[42px] gap-2",

    attentionClass(
      attention,
    ),

    className,
  ].join(" ");

  if (href) {
    if (
      href.startsWith("/")
    ) {
      return (
        <Link
          {...rest}
          to={href}
          onClick={
            onClick
          }
          className={
            classes
          }
        >
          {content}
        </Link>
      );
    }

    return (
      <a
        {...rest}
        href={href}
        onClick={onClick}
        className={
          classes
        }
      >
        {content}
      </a>
    );
  }

  return (
    <div
      {...rest}
      role="button"
      tabIndex={0}
      onClick={onClick}
      className={
        classes
      }
    >
      {content}
    </div>
  );
}