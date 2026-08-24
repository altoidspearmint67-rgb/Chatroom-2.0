import {
  useState,
} from "react";

import {
  MessageCircle,
  UserPlus,
} from "lucide-react";

import {
  UserStatus,
} from "../ui";


/* =========================================================
   ROLE DISPLAY

   ONLY:
   role === "owner" -> GOD image

   EVERY OTHER DATABASE ROLE -> MEMBER CSS badge
   ========================================================= */

const OWNER_ROLE_IMAGE =
  "/assets/ranks/God-Rank.png";


/* =========================================================
   HELPERS
   ========================================================= */

function normalizeRole(
  role,
) {
  return String(
    role || "Member",
  )
    .trim()
    .toLowerCase()
    .replace(
      /[\s_-]+/g,
      "",
    );
}


function getRole(
  user,
  member,
) {
  return (
    member?.role ||
    user?.role ||
    member?.roleName ||
    user?.roleName ||
    "Member"
  );
}


function getDisplayName(
  user,
  member,
) {
  return (
    member?.displayName ||
    user?.displayName ||
    member?.username ||
    user?.username ||
    "Unknown User"
  );
}


function getAvatar(
  user,
  member,
) {
  return (
    member?.avatarURL ||
    user?.avatarURL ||
    member?.avatar ||
    user?.avatar ||
    user?.photoURL ||
    ""
  );
}


function getTitle(
  user,
  member,
) {
  return (
    member?.title ||
    user?.title ||
    "Member"
  );
}


function getStatus(
  user,
  member,
) {
  return (
    member?.status ||
    user?.status ||
    "Offline"
  );
}


function getMessageCount(
  user,
  member,
) {
  const value =
    member?.messageCount ??
    user?.messageCount ??
    0;


  const number =
    Number(
      value,
    );


  return Number.isFinite(
    number,
  )
    ? number
    : 0;
}


/*
 * Use the actual membership/account date
 * stored in Firestore.
 *
 * Supports both current and legacy profiles.
 */

function getJoinedAt(
  user,
  member,
) {
  return (
    member?.memberSince ||
    user?.memberSince ||
    member?.createdAt ||
    user?.createdAt ||
    member?.legacyRegistrationDate ||
    user?.legacyRegistrationDate ||
    member?.joinedAt ||
    user?.joinedAt ||
    null
  );
}


function valueToDate(
  value,
) {
  if (!value) {
    return null;
  }


  /* Firestore Timestamp */

  if (
    typeof value.toDate ===
    "function"
  ) {
    return value.toDate();
  }


  /* Firestore timestamp-like */

  if (
    typeof value.seconds ===
    "number"
  ) {
    return new Date(
      value.seconds *
        1000,
    );
  }


  const date =
    new Date(
      value,
    );


  if (
    Number.isNaN(
      date.getTime(),
    )
  ) {
    return null;
  }


  return date;
}


function formatMemberSince(
  value,
) {
  const date =
    valueToDate(
      value,
    );


  if (!date) {
    return "Unknown";
  }


  return date.toLocaleDateString(
    [],
    {
      month:
        "short",

      day:
        "numeric",

      year:
        "numeric",
    },
  );
}


function calculateMonthsOfService(
  joinedAt,
) {
  const joined =
    valueToDate(
      joinedAt,
    );


  if (!joined) {
    return 0;
  }


  const now =
    new Date();


  let months =
    (
      now.getFullYear() -
      joined.getFullYear()
    ) *
      12 +
    (
      now.getMonth() -
      joined.getMonth()
    );


  if (
    now.getDate() <
    joined.getDate()
  ) {
    months -= 1;
  }


  return Math.max(
    0,
    months,
  );
}


function getMonthsOfService(
  user,
  member,
  joinedAt,
) {
  /*
   * If Firestore already has the value,
   * use it directly.
   */

  const storedValue =
    member?.monthsOfService ??
    user?.monthsOfService;


  if (
    storedValue !==
      undefined &&
    storedValue !==
      null
  ) {
    const number =
      Number(
        storedValue,
      );


    if (
      Number.isFinite(
        number,
      )
    ) {
      return Math.max(
        0,
        number,
      );
    }
  }


  /*
   * Otherwise calculate it from the
   * real database registration date.
   */

  return calculateMonthsOfService(
    joinedAt,
  );
}


/* =========================================================
   SQUARE PROFILE PICTURE

   This is intentionally NOT using the shared Avatar
   component because Avatar is circular throughout the app.

   The profile card specifically uses a square image.
   ========================================================= */

function ProfilePicture({
  src,
  name,
}) {
  const [
    failed,
    setFailed,
  ] = useState(false);


  if (
    !src ||
    failed
  ) {
    return (
      <div
        className="
          grid
          h-[86px]
          w-[86px]
          place-items-center

          overflow-hidden
          rounded-md

          bg-[var(--md-sys-color-surface-container-highest)]

          text-xl
          font-semibold

          text-white/75
        "
      >
        {String(
          name || "?",
        )
          .slice(
            0,
            2,
          )
          .toUpperCase()}
      </div>
    );
  }


  return (
    <img
      src={src}
      alt={`${name} profile`}
      draggable={false}
      onError={() =>
        setFailed(
          true,
        )
      }
      className="
        block
        h-[86px]
        w-[86px]

        select-none

        rounded-md

        object-cover
      "
    />
  );
}


/* =========================================================
   ROLE DISPLAY
   ========================================================= */

function RoleDisplay({
  role,
}) {
  const normalizedRole =
    normalizeRole(
      role,
    );


  const isOwner =
    normalizedRole ===
    "owner";


  /*
   * OWNER -> GOD
   */

  if (isOwner) {
    return (
      <div
        className="
          flex
          min-h-[74px]
          w-full
          items-center
          justify-center
        "
      >
        <img
          src={
            OWNER_ROLE_IMAGE
          }
          alt="Owner role"
          draggable={false}
          className="
            block

            max-h-[70px]
            w-[215px]
            max-w-full

            select-none
            object-contain
          "
        />
      </div>
    );
  }


  /*
   * EVERY OTHER DATABASE ROLE -> MEMBER
   */

  return (
    <div
      className="
        flex
        min-h-[58px]
        w-full
        items-center
        justify-center
      "
    >
      <div
        className="
          inline-flex

          h-[30px]
          min-w-[110px]

          items-center
          justify-center

          border
          border-[#6997ff]

          bg-[#25375e]

          px-5

          text-[12px]
          font-bold
          uppercase
          tracking-[0.1em]

          text-[#b3c9ff]

          shadow-[inset_0_0_0_1px_rgba(255,255,255,0.05)]
        "
      >
        MEMBER
      </div>
    </div>
  );
}


/* =========================================================
   BADGES
   ========================================================= */

function BadgeList({
  badges,
}) {
  if (
    !Array.isArray(
      badges,
    ) ||
    badges.length ===
      0
  ) {
    return null;
  }


  const validBadges =
    badges.filter(
      (
        badge,
      ) =>
        typeof badge ===
          "string" ||
        badge?.image ||
        badge?.icon ||
        badge?.url,
    );


  if (
    validBadges.length ===
    0
  ) {
    return null;
  }


  return (
    <div
      className="
        flex
        flex-wrap
        items-center
        justify-center
        gap-1.5
      "
    >
      {validBadges.map(
        (
          badge,
          index,
        ) => {
          const src =
            typeof badge ===
            "string"
              ? badge
              : badge.image ||
                badge.icon ||
                badge.url;


          if (!src) {
            return null;
          }


          return (
            <img
              key={
                badge.id ||
                src ||
                index
              }
              src={src}
              alt={
                badge.name ||
                "Badge"
              }
              title={
                badge.name ||
                undefined
              }
              draggable={false}
              className="
                h-5
                w-5
                select-none
                object-contain
              "
            />
          );
        },
      )}
    </div>
  );
}


/* =========================================================
   INFO ROW
   ========================================================= */

function InfoRow({
  label,
  value,
}) {
  return (
    <div
      className="
        flex
        min-h-[30px]
        items-center
        justify-between
        gap-3

        border-t
        border-white/10

        px-1
        py-1.5
      "
    >
      <span
        className="
          shrink-0
          text-[11px]
          text-white/40
        "
      >
        {label}
      </span>


      <span
        className="
          min-w-0
          truncate

          text-right
          text-[11px]
          font-medium

          text-white/85
        "
      >
        {value}
      </span>
    </div>
  );
}


/* =========================================================
   PROFILE PANEL
   ========================================================= */

export function ProfilePanel({
  user = {},
  member = null,

  onMessage,
  onAddFriend,

  showActions = true,
}) {
  const displayName =
    getDisplayName(
      user,
      member,
    );


  const avatar =
    getAvatar(
      user,
      member,
    );


  const title =
    getTitle(
      user,
      member,
    );


  const status =
    getStatus(
      user,
      member,
    );


  const role =
    getRole(
      user,
      member,
    );


  const messageCount =
    getMessageCount(
      user,
      member,
    );


  const joinedAt =
    getJoinedAt(
      user,
      member,
    );


  const monthsOfService =
    getMonthsOfService(
      user,
      member,
      joinedAt,
    );


  const badges =
    member?.badges ||
    user?.badges ||
    [];


  return (
    <div
      className="
        mx-auto
        w-[250px]
        max-w-full

        rounded-lg
        border
        border-white/[0.06]

        bg-[var(--md-sys-color-surface-container-high)]

        p-3

        text-[var(--md-sys-color-on-surface)]

        shadow-xl
      "
    >
      {/* USERNAME */}

      <div
        className="
          mb-3
          px-2
          text-center
        "
      >
        <div
          className="
            truncate
            text-[15px]
            font-semibold
            text-white
          "
        >
          {displayName}
        </div>
      </div>


      {/* SQUARE PROFILE PICTURE */}

      <div
        className="
          flex
          justify-center
          px-3
        "
      >
        <ProfilePicture
          src={avatar}
          name={
            displayName
          }
        />
      </div>


      {/* TITLE + STATUS */}

      <div
        className="
          mt-3

          flex
          min-w-0
          items-center
          justify-center
          gap-1.5

          px-3
        "
      >
        <span
          className="
            min-w-0
            truncate

            text-[12px]
            font-medium

            text-white/65
          "
        >
          {title}
        </span>


        <UserStatus
          status={
            status
          }
          size="8px"
        />
      </div>


      {/* ROLE */}

      <div
        className="
          mt-2
          px-1
        "
      >
        <RoleDisplay
          role={
            role
          }
        />
      </div>


      {/* BADGES */}

      {badges.length >
        0 && (
        <div
          className="
            mt-1
            px-3
          "
        >
          <BadgeList
            badges={
              badges
            }
          />
        </div>
      )}


      {/* DATABASE INFORMATION */}

      <div
        className="
          mt-4

          border-b
          border-white/10

          px-1
        "
      >
        <InfoRow
          label="Messages"
          value={
            messageCount.toLocaleString()
          }
        />


        <InfoRow
          label="Member Since"
          value={
            formatMemberSince(
              joinedAt,
            )
          }
        />


        <InfoRow
          label="Months of Service"
          value={
            `${monthsOfService} ${
              monthsOfService ===
              1
                ? "Month"
                : "Months"
            }`
          }
        />
      </div>


      {/* ACTIONS */}

      {showActions &&
        (
          onMessage ||
          onAddFriend
        ) && (
          <div
            className="
              mt-3

              flex
              gap-2

              px-1
            "
          >
            {onMessage && (
              <button
                type="button"
                onClick={
                  onMessage
                }
                className="
                  inline-flex
                  h-9
                  flex-1
                  items-center
                  justify-center
                  gap-2

                  rounded-lg

                  bg-[var(--md-sys-color-primary-container)]

                  px-3

                  text-xs
                  font-medium

                  text-[var(--md-sys-color-on-primary-container)]

                  transition-colors

                  hover:brightness-110
                "
              >
                <MessageCircle
                  size={14}
                />

                Message
              </button>
            )}


            {onAddFriend && (
              <button
                type="button"
                onClick={
                  onAddFriend
                }
                className="
                  inline-flex
                  h-9
                  flex-1
                  items-center
                  justify-center
                  gap-2

                  rounded-lg

                  bg-[var(--md-sys-color-surface-container-highest)]

                  px-3

                  text-xs
                  font-medium

                  text-white/80

                  transition-colors

                  hover:bg-[var(--md-sys-color-surface-bright)]
                "
              >
                <UserPlus
                  size={14}
                />

                Add Friend
              </button>
            )}
          </div>
        )}
    </div>
  );
}