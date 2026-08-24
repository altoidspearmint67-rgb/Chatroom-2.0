import {
  useEffect,
  useState,
} from "react";

import {
  ProfilePanel,
} from "./ProfilePanel";

import {
  UserProfileModal,
} from "./UserProfileModal";


function useMobile() {
  const [mobile, setMobile] =
    useState(() =>
      window.matchMedia(
        "(max-width: 600px)",
      ).matches,
    );

  useEffect(() => {
    const query =
      window.matchMedia(
        "(max-width: 600px)",
      );

    function update() {
      setMobile(
        query.matches,
      );
    }

    query.addEventListener(
      "change",
      update,
    );

    return () =>
      query.removeEventListener(
        "change",
        update,
      );
  }, []);

  return mobile;
}


export function UserCard({
  user,
  member,
  anchorRect,
  onClose,
  onMessage,
  onMore,
  ...rest
}) {
  const isMobile =
    useMobile();

  if (!user) {
    return null;
  }


  /*
   * MOBILE
   *
   * The same profile design is used,
   * but presented as a modal.
   */
  if (isMobile) {
    return (
      <UserProfileModal
        show
        user={user}
        member={member}
        onClose={
          onClose
        }
        onMessage={
          onMessage
        }
        onMore={
          onMore
        }
        {...rest}
      />
    );
  }


  /*
   * DESKTOP POSITIONING
   */

  const CARD_WIDTH =
    300;

  const estimatedHeight =
    520;

  let left =
    anchorRect
      ? anchorRect.right +
        10
      : 80;

  let top =
    anchorRect
      ? anchorRect.top
      : 80;


  /*
   * Prevent card from
   * leaving right edge.
   */
  if (
    left +
      CARD_WIDTH +
      8 >
    window.innerWidth
  ) {
    left =
      anchorRect
        ? anchorRect.left -
          CARD_WIDTH -
          10
        : 8;
  }


  /*
   * Prevent card from
   * leaving bottom edge.
   */
  if (
    top +
      estimatedHeight +
      8 >
    window.innerHeight
  ) {
    top =
      Math.max(
        8,
        window.innerHeight -
          estimatedHeight -
          8,
      );
  }


  return (
    <>
      {/* CLICK-AWAY AREA */}

      <button
        type="button"
        aria-label="Close profile"
        onClick={
          onClose
        }
        className="
          fixed
          inset-0
          z-[390]
          cursor-default
          bg-transparent
        "
      />


      {/* PROFILE */}

      <div
        onPointerDown={(
          event,
        ) =>
          event.stopPropagation()
        }
        style={{
          left,
          top,
          width:
            CARD_WIDTH,
        }}
        className="
          fixed
          z-[400]
          max-h-[calc(100dvh-16px)]
          overflow-y-auto
          rounded-[18px]
        "
      >
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
    </>
  );
}