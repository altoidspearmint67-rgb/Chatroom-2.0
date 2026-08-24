import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";

import { createPortal } from "react-dom";

import {
  BellOff,
  Copy,
  Info,
  Pencil,
  Trash2,
} from "lucide-react";

const STATUSES = [
  {
    value: "Online",
    label: "Online",
    className: "bg-emerald-500",
  },
  {
    value: "Idle",
    label: "Idle",
    className: "bg-amber-400",
  },
  {
    value: "Focus",
    label: "Focus",
    className: "bg-violet-500",
  },
  {
    value: "Busy",
    label: "Do Not Disturb",
    className: "bg-red-500",
  },
  {
    value: "Invisible",
    label: "Invisible",
    className: "bg-zinc-500",
  },
];

function MenuButton({
  icon,
  children,
  onClick,
  title,
}) {
  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      className="
        flex
        w-full
        items-center
        gap-3
        rounded-md
        px-3
        py-2
        text-left
        text-sm
        text-[var(--md-sys-color-on-surface)]
        hover:bg-white/7
      "
    >
      <span className="flex w-4 shrink-0 justify-center">
        {icon}
      </span>

      <span className="min-w-0 flex-1">
        {children}
      </span>
    </button>
  );
}

function Divider() {
  return (
    <div
      className="
        my-1
        h-px
        bg-[var(--md-sys-color-outline-variant)]
      "
    />
  );
}

function Avatar({ user }) {
  const label =
    user?.displayName ||
    user?.username ||
    "User";

  if (user?.avatarURL) {
    return (
      <img
        src={user.avatarURL}
        alt=""
        className="h-8 w-8 rounded-full object-cover"
      />
    );
  }

  return (
    <div
      className="
        grid
        h-8
        w-8
        place-items-center
        rounded-full
        bg-[var(--md-sys-color-primary-container)]
        text-xs
        font-bold
      "
    >
      {label.slice(0, 2).toUpperCase()}
    </div>
  );
}

export function UserMenu({
  anchorRef,
  user,
  onSettings = () => {},
  onPresenceChange = () => {},
  onAddStatus = () => {},
  onClearStatus = () => {},
  showCopyId = true,
}) {
  const [show, setShow] = useState(false);

  const [position, setPosition] =
    useState({
      top: 0,
      left: 0,
    });

  const menuRef = useRef(null);

  useEffect(() => {
    const anchor = anchorRef?.current;

    if (!anchor) {
      return;
    }

    const toggle = (event) => {
      event.preventDefault();

      setShow((value) => !value);
    };

    anchor.addEventListener(
      "click",
      toggle,
    );

    return () =>
      anchor.removeEventListener(
        "click",
        toggle,
      );
  }, [anchorRef]);

  useLayoutEffect(() => {
    if (
      !show ||
      !anchorRef?.current
    ) {
      return;
    }

    const update = () => {
      const rect =
        anchorRef.current.getBoundingClientRect();

      const menuWidth = 250;

      const menuHeight =
        menuRef.current?.offsetHeight ??
        360;

      const left = Math.min(
        rect.right + 5,
        window.innerWidth -
          menuWidth -
          8,
      );

      const top = Math.max(
        8,
        Math.min(
          rect.top,
          window.innerHeight -
            menuHeight -
            8,
        ),
      );

      setPosition({
        top,
        left,
      });
    };

    update();

    window.addEventListener(
      "resize",
      update,
    );

    window.addEventListener(
      "scroll",
      update,
      true,
    );

    return () => {
      window.removeEventListener(
        "resize",
        update,
      );

      window.removeEventListener(
        "scroll",
        update,
        true,
      );
    };
  }, [show, anchorRef]);

  useEffect(() => {
    if (!show) {
      return;
    }

    const closeOutside = (
      event,
    ) => {
      if (
        anchorRef?.current?.contains(
          event.target,
        )
      ) {
        return;
      }

      if (
        menuRef.current?.contains(
          event.target,
        )
      ) {
        return;
      }

      setShow(false);
    };

    document.addEventListener(
      "pointerdown",
      closeOutside,
    );

    return () =>
      document.removeEventListener(
        "pointerdown",
        closeOutside,
      );
  }, [show, anchorRef]);

  if (!show) {
    return null;
  }

  const copyId = async () => {
    if (!user?.id) {
      return;
    }

    await navigator.clipboard.writeText(
      user.id,
    );

    setShow(false);
  };

  return createPortal(
    <div
      ref={menuRef}
      className="
        fixed
        z-[100]
        w-[250px]
        rounded-xl
        border
        border-white/8
        bg-[#202126]
        p-1.5
        shadow-2xl
      "
      style={{
        top: position.top,
        left: position.left,
        animation:
          "user-menu-in 160ms cubic-bezier(.87,0,.13,1)",
      }}
    >
      <button
        type="button"
        onClick={() => {
          onSettings();
          setShow(false);
        }}
        className="
          flex
          w-full
          items-center
          gap-3
          rounded-lg
          px-3
          py-2
          text-left
          hover:bg-white/7
        "
      >
        <Avatar user={user} />

        <span className="min-w-0">
          <span
            className="
              block
              truncate
              text-sm
              font-semibold
              text-white
            "
          >
            {user?.displayName ||
              user?.username ||
              "User"}
          </span>

          <span
            className="
              block
              truncate
              text-xs
              text-white/50
            "
          >
            {user?.username || "user"}

            {user?.discriminator
              ? `#${user.discriminator}`
              : ""}
          </span>
        </span>
      </button>

      <Divider />

      {STATUSES.map((status) => (
        <MenuButton
          key={status.value}
          onClick={() => {
            onPresenceChange(
              status.value,
            );

            setShow(false);
          }}
          icon={
            <span
              className={`
                h-2.5
                w-2.5
                rounded-full
                ${status.className}
              `}
            />
          }
        >
          <span className="flex items-center gap-2">
            {status.label}

            {status.value ===
              "Focus" && (
              <Info
                size={12}
                className="text-white/45"
              />
            )}

            {status.value ===
              "Busy" && (
              <BellOff
                size={12}
                className="text-white/45"
              />
            )}
          </span>
        </MenuButton>
      ))}

      <Divider />

      {user?.status?.text ? (
        <>
          <MenuButton
            icon={
              <Pencil size={15} />
            }
            onClick={() => {
              onAddStatus();
              setShow(false);
            }}
          >
            <span
              className="
                block
                max-w-[185px]
                truncate
              "
            >
              {user.status.text}
            </span>
          </MenuButton>

          <MenuButton
            icon={
              <Trash2 size={15} />
            }
            onClick={() => {
              onClearStatus();
              setShow(false);
            }}
          >
            Clear status
          </MenuButton>
        </>
      ) : (
        <MenuButton
          icon={
            <Pencil size={15} />
          }
          onClick={() => {
            onAddStatus();
            setShow(false);
          }}
        >
          Add status text
        </MenuButton>
      )}

      {showCopyId && (
        <MenuButton
          icon={<Copy size={15} />}
          onClick={copyId}
        >
          Copy user ID
        </MenuButton>
      )}
    </div>,

    document.body,
  );
}