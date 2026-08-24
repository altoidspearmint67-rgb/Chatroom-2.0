import {
  X,
} from "lucide-react";

import {
  ProfilePanel,
} from "./ProfilePanel";


export function UserProfileModal({
  show,
  user,
  member,
  onClose,
  onMessage,
  onMore,
}) {
  if (
    !show ||
    !user
  ) {
    return null;
  }

  return (
    <div
      className="
        fixed
        inset-0
        z-[500]

        flex
        items-center
        justify-center

        bg-black/55

        p-4

        backdrop-blur-[2px]
      "
      onMouseDown={(
        event,
      ) => {
        if (
          event.target ===
          event.currentTarget
        ) {
          onClose?.();
        }
      }}
    >
      <div
        className="
          relative

          max-h-[calc(100dvh-32px)]

          w-full
          max-w-[320px]

          overflow-y-auto

          rounded-[var(--borderRadius-xl)]

          bg-[var(--md-sys-color-surface-container-high)]
        "
      >
        <button
          type="button"
          onClick={
            onClose
          }
          title="Close"
          className="
            absolute
            right-3
            top-3
            z-30

            grid
            h-8
            w-8
            place-items-center

            rounded-full

            bg-[var(--md-sys-color-surface-container-highest)]

            text-[var(--md-sys-color-outline)]

            transition

            hover:bg-[var(--md-sys-color-surface-bright)]
            hover:text-[var(--md-sys-color-on-surface)]
          "
        >
          <X size={17} />
        </button>

        <ProfilePanel
          user={user}
          member={member}
          onMessage={
            onMessage
          }
          onMore={
            onMore
          }
        />
      </div>
    </div>
  );
}