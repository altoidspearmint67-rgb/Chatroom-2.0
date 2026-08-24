import {
  useMemo,
  useState,
} from "react";

import {
  UserCard,
} from "../../profile";

import {
  Avatar,
  UserStatus,
} from "../../ui";

import {
  getUserProfile,
} from "../../../firebase/friends";


/* =========================================================
   HELPERS
   ========================================================= */

function getMemberId(
  member,
) {
  return (
    member?.uid ||
    member?.id ||
    member?.user?.uid ||
    member?.user?.id ||
    null
  );
}


function getDisplayName(
  member,
) {
  return (
    member?.displayName ||
    member?.nickname ||
    member?.user?.displayName ||
    member?.user?.username ||
    member?.username ||
    member?.name ||
    "Unknown User"
  );
}


function getUsername(
  member,
) {
  return (
    member?.username ||
    member?.user?.username ||
    member?.name ||
    member?.uid ||
    member?.id ||
    "unknown"
  );
}


function getPresence(
  member,
) {
  return (
    member?.status ||
    member?.presence ||
    member?.user?.status ||
    member?.user?.presence ||
    "Offline"
  );
}


function getAvatar(
  member,
) {
  return (
    member?.avatarURL ||
    member?.animatedAvatarURL ||
    member?.user?.avatarURL ||
    member?.user?.animatedAvatarURL ||
    ""
  );
}


/* =========================================================
   HYDRATE MEMBER WITH REAL FIRESTORE PROFILE

   This is the important fix.

   Clicking a member now directly reads:

   users/{uid}

   It no longer depends on ChannelPage having copied every
   profile field correctly.
   ========================================================= */

async function hydrateMemberFromDatabase(
  member,
) {
  const uid =
    getMemberId(
      member,
    );


  if (!uid) {
    return {
      ...member,
    };
  }


  try {
    const databaseProfile =
      await getUserProfile(
        uid,
      );


    if (!databaseProfile) {
      return {
        ...member,

        id:
          member?.id ||
          uid,

        uid,
      };
    }


    /*
     * DATABASE PROFILE COMES LAST.

     * That is intentional.

     * If the channel has:
     * messageCount: 0
     *
     * but Firestore has:
     * messageCount: 10750
     *
     * Firestore wins.
     */

    return {
      ...member,

      ...(member?.user ||
        {}),

      ...databaseProfile,

      id:
        databaseProfile.id ||
        uid,

      uid:
        databaseProfile.uid ||
        uid,
    };
  } catch (error) {
    console.error(
      `Unable to fetch real profile for ${uid}:`,
      error,
    );


    return {
      ...member,

      id:
        member?.id ||
        uid,

      uid,
    };
  }
}


/* =========================================================
   BUILD USER FOR USERCARD

   At this point "member" has already been hydrated directly
   from Firestore.
   ========================================================= */

function buildUserFromMember(
  member,
) {
  const uid =
    getMemberId(
      member,
    );


  const displayName =
    getDisplayName(
      member,
    );


  const username =
    getUsername(
      member,
    );


  const avatarURL =
    getAvatar(
      member,
    );


  const status =
    getPresence(
      member,
    );


  return {
    /*
     * KEEP THE ENTIRE FIRESTORE DOCUMENT.
     */

    ...member,


    /*
     * NORMALIZED FIELDS FOR THE EXISTING UI.
     */

    id:
      member?.id ||
      uid,

    uid:
      member?.uid ||
      uid,

    username,

    displayName,

    avatarURL,

    animatedAvatarURL:
      member?.animatedAvatarURL ||
      avatarURL,

    profilePictureUrl:
      avatarURL,

    status,

    presence:
      status,

    statusText:
      typeof status ===
      "string"
        ? status
        : "",

    relationship:
      member?.relationship ||
      "None",

    badges:
      Array.isArray(
        member?.badges,
      )
        ? member.badges
        : [],

    self:
      Boolean(
        member?.self,
      ),

    bot:
      Boolean(
        member?.bot,
      ),

    mutualUsers:
      member?.mutualUsers ||
      [],

    mutualGroups:
      member?.mutualGroups ||
      [],
  };
}


/* =========================================================
   BUILD MEMBER FOR PROFILE PANEL

   Again: ALL Firestore fields are kept.
   ========================================================= */

function buildProfileMember(
  member,
  channel,
) {
  const uid =
    getMemberId(
      member,
    );


  const status =
    getPresence(
      member,
    );


  /*
   * Account creation date.

   * Your migrated Starry account has:
   * createdAt = May 30, 2024

   * That is what we want displayed.
   */

  const accountCreatedAt =
    member?.createdAt ||
    member?.memberSince ||
    member
      ?.legacyRegistrationDate ||
    null;


  return {
    /*
     * DO NOT STRIP DATABASE FIELDS.
     */

    ...member,

    id:
      member?.id ||
      uid,

    uid:
      member?.uid ||
      uid,

    username:
      getUsername(
        member,
      ),

    displayName:
      getDisplayName(
        member,
      ),

    avatarURL:
      getAvatar(
        member,
      ),

    animatedAvatarURL:
      member
        ?.animatedAvatarURL ||
      getAvatar(
        member,
      ),

    profilePictureUrl:
      getAvatar(
        member,
      ),

    status,

    presence:
      status,

    statusText:
      typeof status ===
      "string"
        ? status
        : "",


    /*
     * DATABASE PROFILE VALUES
     */

    messageCount:
      member?.messageCount ??
      0,

    credits:
      member?.credits ??
      0,

    role:
      member?.role ||
      "Member",

    roleName:
      member?.role ||
      member?.roleName ||
      "Member",

    title:
      member?.title ||
      "Member",

    badges:
      Array.isArray(
        member?.badges,
      )
        ? member.badges
        : [],


    /*
     * IMPORTANT:
     *
     * Do NOT use Date.now().
     */

    createdAt:
      member?.createdAt ||
      null,

    memberSince:
      member?.memberSince ||
      accountCreatedAt,

    joinedAt:
      accountCreatedAt,

    legacyRegistrationDate:
      member
        ?.legacyRegistrationDate ||
      null,

    monthsOfService:
      member
        ?.monthsOfService,


    /*
     * OTHER DATABASE FIELDS REMAIN AVAILABLE
     */

    migratedAt:
      member?.migratedAt,

    migratedFromLegacy:
      member
        ?.migratedFromLegacy,

    legacyProject:
      member?.legacyProject,

    legacyUid:
      member?.legacyUid,

    lastSeenAt:
      member?.lastSeenAt,

    updatedAt:
      member?.updatedAt,

    pronouns:
      member?.pronouns,

    bio:
      member?.bio,

    serverName:
      channel?.server?.name ||
      channel?.serverName ||
      channel?.name ||
      "Group Chat",

    canEdit:
      Boolean(
        member?.canEdit,
      ),

    orderedRoles:
      member?.orderedRoles ||
      [],
  };
}


/* =========================================================
   MEMBER ROW
   ========================================================= */

function Member({
  member,
  onOpenProfile,
  opening = false,
}) {
  const displayName =
    getDisplayName(
      member,
    );


  const presence =
    getPresence(
      member,
    );


  const avatar =
    getAvatar(
      member,
    );


  const roleName =
    member?.role ||
    member?.roleName ||
    "";


  return (
    <button
      type="button"
      disabled={
        opening
      }
      onClick={(
        event,
      ) =>
        onOpenProfile(
          member,
          event,
        )
      }
      className="
        group

        flex
        w-full
        min-w-0
        items-center
        gap-3

        rounded-xl

        px-2
        py-2

        text-left

        transition-colors

        hover:bg-white/[0.06]

        disabled:cursor-default
        disabled:opacity-60
      "
    >
      <div
        className="
          relative
          shrink-0
        "
      >
        <Avatar
          src={
            avatar
          }
          fallback={
            displayName
          }
          size={36}
        />


        <div
          className="
            absolute

            bottom-[-1px]
            right-[-1px]

            rounded-full

            border-[3px]
            border-[var(--md-sys-color-surface-container-low)]
          "
        >
          <UserStatus
            status={
              presence
            }
            size="10px"
          />
        </div>
      </div>


      <div
        className="
          min-w-0
          flex-1
        "
      >
        <div
          className="
            truncate

            text-sm
            font-medium

            text-[var(--md-sys-color-on-surface)]
          "
        >
          {displayName}
        </div>


        {roleName && (
          <div
            className="
              mt-0.5

              truncate

              text-[11px]

              text-[var(--md-sys-color-outline)]
            "
          >
            {roleName}
          </div>
        )}
      </div>
    </button>
  );
}


/* =========================================================
   CATEGORY
   ========================================================= */

function Category({
  title,
  members,
  onOpenProfile,
  openingUserId,
}) {
  if (
    !members?.length
  ) {
    return null;
  }


  return (
    <section
      className="
        flex
        flex-col
      "
    >
      <div
        className="
          px-3
          pb-1
          pt-4

          text-[11px]
          font-semibold
          uppercase
          tracking-wide

          text-[var(--md-sys-color-outline)]
        "
      >
        {title} —{" "}
        {members.length}
      </div>


      <div
        className="
          flex
          flex-col

          px-1
        "
      >
        {members.map(
          (
            member,
          ) => (
            <Member
              key={
                getMemberId(
                  member,
                )
              }
              member={
                member
              }
              opening={
                openingUserId ===
                getMemberId(
                  member,
                )
              }
              onOpenProfile={
                onOpenProfile
              }
            />
          ),
        )}
      </div>
    </section>
  );
}


/* =========================================================
   SERVER MEMBER SIDEBAR
   ========================================================= */

function ServerMemberSidebar({
  channel,
  onOpenProfile,
  openingUserId,
}) {
  const members =
    channel.members ||
    [];


  const {
    online,
    offline,
  } = useMemo(
    () => {
      const sorted = [
        ...members,
      ].sort(
        (
          a,
          b,
        ) =>
          getDisplayName(
            a,
          ).localeCompare(
            getDisplayName(
              b,
            ),
          ),
      );


      return {
        online:
          sorted.filter(
            (
              member,
            ) =>
              getPresence(
                member,
              ) !==
              "Offline",
          ),

        offline:
          sorted.filter(
            (
              member,
            ) =>
              getPresence(
                member,
              ) ===
              "Offline",
          ),
      };
    },
    [
      members,
    ],
  );


  return (
    <div
      className="
        flex
        min-h-0
        flex-1
        flex-col

        overflow-y-auto

        px-1
        pb-4
      "
    >
      <Category
        title="Online"
        members={
          online
        }
        onOpenProfile={
          onOpenProfile
        }
        openingUserId={
          openingUserId
        }
      />


      <Category
        title="Offline"
        members={
          offline
        }
        onOpenProfile={
          onOpenProfile
        }
        openingUserId={
          openingUserId
        }
      />
    </div>
  );
}


/* =========================================================
   GROUP MEMBER SIDEBAR
   ========================================================= */

function GroupMemberSidebar({
  channel,
  onOpenProfile,
  openingUserId,
}) {
  const members =
    channel.recipients ||
    channel.members ||
    [];


  const sorted =
    useMemo(
      () =>
        [
          ...members,
        ].sort(
          (
            a,
            b,
          ) =>
            getDisplayName(
              a,
            ).localeCompare(
              getDisplayName(
                b,
              ),
            ),
        ),
      [
        members,
      ],
    );


  return (
    <div
      className="
        flex
        min-h-0
        flex-1
        flex-col

        overflow-y-auto

        px-1
        pb-4
      "
    >
      <Category
        title="Members"
        members={
          sorted
        }
        onOpenProfile={
          onOpenProfile
        }
        openingUserId={
          openingUserId
        }
      />
    </div>
  );
}


/* =========================================================
   MAIN MEMBER SIDEBAR
   ========================================================= */

export function MemberSidebar({
  channel,
}) {
  const [
    selectedProfile,
    setSelectedProfile,
  ] = useState(null);


  const [
    openingUserId,
    setOpeningUserId,
  ] = useState(null);


  /* =========================================================
     OPEN PROFILE

     THIS NOW FETCHES FIRESTORE DIRECTLY.
     ========================================================= */

  async function openProfile(
    member,
    event,
  ) {
    const rect =
      event.currentTarget.getBoundingClientRect();


    const memberId =
      getMemberId(
        member,
      );


    if (!memberId) {
      console.error(
        "Cannot open profile: member has no UID.",
        member,
      );

      return;
    }


    setOpeningUserId(
      memberId,
    );


    try {
      /*
       * DIRECT DATABASE READ.
       */

      const hydratedMember =
        await hydrateMemberFromDatabase(
          member,
        );


      /*
       * At this point this should contain exactly
       * what exists in Firestore.
       *
       * For Starry:
       *
       * messageCount = 10750
       * createdAt = May 30, 2024
       * credits = 14295198
       * role = Owner
       * title = Chatroom Emperor
       */


      const user =
        buildUserFromMember(
          hydratedMember,
        );


      const profileMember =
        buildProfileMember(
          hydratedMember,
          channel,
        );


      setSelectedProfile({
        user,

        member:
          profileMember,

        originalMember:
          hydratedMember,

        anchorRect: {
          top:
            rect.top,

          right:
            rect.right,

          bottom:
            rect.bottom,

          left:
            rect.left,

          width:
            rect.width,

          height:
            rect.height,
        },
      });
    } catch (error) {
      console.error(
        "Unable to open user profile:",
        error,
      );
    } finally {
      setOpeningUserId(
        null,
      );
    }
  }


  function closeProfile() {
    setSelectedProfile(
      null,
    );
  }


  /* =========================================================
     RELATIONSHIP ACTIONS
     ========================================================= */

  function updateRelationship(
    relationship,
  ) {
    setSelectedProfile(
      (
        current,
      ) => {
        if (!current) {
          return current;
        }


        return {
          ...current,

          user: {
            ...current.user,

            relationship,
          },
        };
      },
    );
  }


  function addFriend() {
    const relationship =
      selectedProfile
        ?.user
        ?.relationship;


    if (
      relationship ===
      "Incoming"
    ) {
      updateRelationship(
        "Friend",
      );
    } else {
      updateRelationship(
        "Outgoing",
      );
    }
  }


  function removeFriend() {
    updateRelationship(
      "None",
    );
  }


  /* =========================================================
     EXISTING MESSAGE ACTION
     ========================================================= */

  function openMessage(
    user,
  ) {
    if (
      user.id ===
        "alex" ||
      user.username ===
        "alex"
    ) {
      window.location.href =
        "/channel/alex";

      return;
    }


    window.alert(
      `Direct message with ${
        user.displayName ||
        user.username
      } will open here once the backend is connected.`,
    );
  }


  function openMore(
    user,
  ) {
    window.alert(
      `User menu for ${
        user.displayName ||
        user.username
      }`,
    );
  }


  function openEdit(
    user,
  ) {
    window.alert(
      `Edit profile / server identity for ${
        user.displayName ||
        user.username
      }`,
    );
  }


  /* =========================================================
     SIDEBAR CONTENT
     ========================================================= */

  let content =
    null;


  switch (
    channel.type
  ) {
    case "TextChannel":
      content = (
        <ServerMemberSidebar
          channel={
            channel
          }
          onOpenProfile={
            openProfile
          }
          openingUserId={
            openingUserId
          }
        />
      );
      break;


    case "Group":
      content = (
        <GroupMemberSidebar
          channel={
            channel
          }
          onOpenProfile={
            openProfile
          }
          openingUserId={
            openingUserId
          }
        />
      );
      break;


    default:
      content =
        null;
  }


  /* =========================================================
     RENDER
     ========================================================= */

  return (
    <>
      {content}


      {selectedProfile && (
        <UserCard
          user={
            selectedProfile.user
          }
          member={
            selectedProfile.member
          }
          profile={{
            content:
              selectedProfile
                .user
                .bio,

            animatedBannerURL:
              selectedProfile
                .user
                .animatedBannerURL,
          }}
          anchorRect={
            selectedProfile.anchorRect
          }
          onClose={
            closeProfile
          }
          onAddFriend={
            addFriend
          }
          onRemoveFriend={
            removeFriend
          }
          onMessage={
            openMessage
          }
          onEdit={
            openEdit
          }
          onMore={
            openMore
          }
        />
      )}
    </>
  );
}