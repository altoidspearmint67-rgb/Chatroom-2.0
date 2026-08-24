import {
  AtSign,
  Ban,
  Bell,
  Bot,
  Cloud,
  EllipsisVertical,
  Grid3X3,
  Hand,
  Hash,
  Inbox,
  Link2,
  Phone,
  Plus,
  Search,
  Send,
  Settings,
  Sparkles,
  StickyNote,
  Users,
} from "lucide-react";

const ICONS = {
  add: Plus,

  group: Users,

  groups:
    Users,

  grid_3x3:
    Grid3X3,

  alternate_email:
    AtSign,

  note_stack:
    StickyNote,

  call:
    Phone,

  search:
    Search,

  waving_hand:
    Hand,

  all_inbox:
    Inbox,

  notifications:
    Bell,

  block:
    Ban,

  send:
    Send,

  smart_toy:
    Bot,

  cloud:
    Cloud,

  link:
    Link2,

  more_vert:
    EllipsisVertical,

  spa:
    Sparkles,

  settings:
    Settings,

  tag:
    Hash,
};

export function Symbol({
  children,

  fill = false,

  size = 20,

  fontSize,

  grade,

  opticalSize,

  type,

  weight,

  className = "",

  ...rest
}) {
  void grade;
  void opticalSize;
  void type;
  void weight;

  const name =
    typeof children ===
    "string"
      ? children
      : "";

  const Icon =
    ICONS[name];

  if (Icon) {
    return (
      <Icon
        {...rest}
        size={
          Number(
            fontSize,
          ) ||
          size
        }
        fill={
          fill
            ? "currentColor"
            : "none"
        }
        className={
          className
        }
      />
    );
  }

  return (
    <span
      {...rest}
      aria-hidden="true"
      className={[
        "block select-none",
        className,
      ].join(" ")}
      style={{
        fontSize:
          typeof fontSize ===
          "number"
            ? `${fontSize}px`
            : fontSize ||
              `${size}px`,
      }}
    >
      {children}
    </span>
  );
}