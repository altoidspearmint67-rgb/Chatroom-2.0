import {
  Home,
  MessageCircle,
  Pin,
  Plus,
  Settings,
  Users,
  UsersRound,
} from "lucide-react";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Link,
  useLocation,
  useNavigate,
} from "react-router-dom";

import {
  useAuth,
} from "../../auth/AuthContext";

import {
  useCurrentProfile,
} from "../../auth/useCurrentProfile";

import {
  getUserProfiles,
} from "../../firebase/friends";

import {
  getOtherDmUserId,
  isConversationPinned,
  subscribeToConversations,
} from "../../firebase/conversations";

import {
  Avatar,
  UserStatus,
} from "../ui";

import {
  SidebarBase,
} from "./common";

import {
  CreateGroupModal,
} from "./CreateGroupModal";


/* =========================================================
   TIMESTAMP
   ========================================================= */

function timestampToMillis(
  value,
) {
  if (!value) {
    return 0;
  }


  if (
    typeof value.toMillis ===
    "function"
  ) {
    return value.toMillis();
  }


  if (
    typeof value.seconds ===
    "number"
  ) {
    return (
      value.seconds *
      1000
    );
  }


  const date =
    new Date(
      value,
    );


  return Number.isNaN(
    date.getTime(),
  )
    ? 0
    : date.getTime();
}


/* =========================================================
   NAV ITEM
   ========================================================= */

function NavigationItem({
  to,
  icon: Icon,
  children,
  badge,
}) {
  const location =
    useLocation();


  const active =
    location.pathname ===
    to;


  return (
    <Link
      to={to}
      className={[
        "flex h-11 items-center gap-3 rounded-[var(--borderRadius-sm)] px-3 text-sm font-medium transition-colors",

        active
          ? "bg-[var(--md-sys-color-surface-container-highest)] text-[var(--md-sys-color-on-surface)]"
          : "text-[var(--md-sys-color-on-surface-variant)] hover:bg-[var(--md-sys-color-surface-container-highest)] hover:text-[var(--md-sys-color-on-surface)]",
      ].join(" ")}
    >
      <Icon
        size={20}
        strokeWidth={1.8}
        className="shrink-0"
      />


      <span
        className="
          min-w-0
          flex-1
          truncate
        "
      >
        {children}
      </span>


      {badge && (
        <span
          className="
            shrink-0
            rounded-md
            bg-[var(--md-sys-color-error)]
            px-2
            py-1
            text-[10px]
            font-semibold
            text-[var(--md-sys-color-on-error)]
          "
        >
          {badge}
        </span>
      )}
    </Link>
  );
}


/* =========================================================
   DM ITEM
   ========================================================= */

function DirectMessageItem({
  conversation,
  profile,
  currentUid,
}) {
  const location =
    useLocation();


  const to =
    `/channel/${conversation.id}`;


  const active =
    location.pathname ===
      to ||
    location.pathname.startsWith(
      `${to}/`,
    );


  const displayName =
    profile?.displayName ||
    profile?.username ||
    "Unknown User";


  const avatarURL =
    profile?.avatarURL ||
    "";


  const status =
    profile?.status ||
    "Offline";


  const preview =
    conversation.lastMessage ||
    "Start a conversation";


  const pinned =
    isConversationPinned(
      conversation,
      currentUid,
    );


  return (
    <Link
      to={to}
      className={[
        "group flex min-w-0 items-center gap-3 rounded-[var(--borderRadius-sm)] px-2 py-2 transition-colors",

        active
          ? "bg-[var(--md-sys-color-surface-container-highest)]"
          : "hover:bg-[var(--md-sys-color-surface-container-highest)]",
      ].join(" ")}
    >
      <div
        className="
          relative
          shrink-0
        "
      >
        <Avatar
          src={
            avatarURL
          }
          fallback={
            displayName
          }
          size={36}
        />


        <div
          className="
            absolute
            -bottom-[1px]
            -right-[1px]
            rounded-full
            border-[3px]
            border-[var(--md-sys-color-surface-container-high)]
          "
        >
          <UserStatus
            status={
              status
            }
            size="9px"
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
            flex
            min-w-0
            items-center
            gap-1.5
          "
        >
          <div
            className="
              min-w-0
              flex-1
              truncate
              text-sm
              font-medium
              text-[var(--md-sys-color-on-surface)]
            "
          >
            {displayName}
          </div>


          {pinned && (
            <Pin
              size={12}
              className="
                shrink-0
                text-[var(--md-sys-color-outline)]
              "
            />
          )}
        </div>


        <div
          className="
            mt-0.5
            truncate
            text-[11px]
            text-[var(--md-sys-color-outline)]
          "
        >
          {preview}
        </div>
      </div>
    </Link>
  );
}


/* =========================================================
   GROUP ITEM
   ========================================================= */

function GroupConversationItem({
  conversation,
  currentUid,
}) {
  const location =
    useLocation();


  const to =
    `/channel/${conversation.id}`;


  const active =
    location.pathname ===
      to ||
    location.pathname.startsWith(
      `${to}/`,
    );


  const displayName =
    conversation.name ||
    "Group Chat";


  const memberCount =
    Array.isArray(
      conversation.members,
    )
      ? conversation.members
          .length
      : 0;


  const preview =
    conversation.lastMessage ||
    `${memberCount} ${
      memberCount === 1
        ? "member"
        : "members"
    }`;


  const pinned =
    isConversationPinned(
      conversation,
      currentUid,
    );


  return (
    <Link
      to={to}
      className={[
        "group flex min-w-0 items-center gap-3 rounded-[var(--borderRadius-sm)] px-2 py-2 transition-colors",

        active
          ? "bg-[var(--md-sys-color-surface-container-highest)]"
          : "hover:bg-[var(--md-sys-color-surface-container-highest)]",
      ].join(" ")}
    >
      <div
        className="
          grid
          h-9
          w-9
          shrink-0
          place-items-center
          rounded-full
          bg-[var(--md-sys-color-surface-container-highest)]
          text-[var(--md-sys-color-on-surface-variant)]
        "
      >
        <UsersRound
          size={18}
        />
      </div>


      <div
        className="
          min-w-0
          flex-1
        "
      >
        <div
          className="
            flex
            min-w-0
            items-center
            gap-1.5
          "
        >
          <div
            className="
              min-w-0
              flex-1
              truncate
              text-sm
              font-medium
              text-[var(--md-sys-color-on-surface)]
            "
          >
            {displayName}
          </div>


          {pinned && (
            <Pin
              size={12}
              className="
                shrink-0
                text-[var(--md-sys-color-outline)]
              "
            />
          )}
        </div>


        <div
          className="
            mt-0.5
            truncate
            text-[11px]
            text-[var(--md-sys-color-outline)]
          "
        >
          {preview}
        </div>
      </div>
    </Link>
  );
}


/* =========================================================
   CURRENT USER
   ========================================================= */

function CurrentUser() {
  const navigate =
    useNavigate();


  const {
    profile,
    loading,
  } = useCurrentProfile();


  const displayName =
    profile?.displayName ||
    profile?.username ||
    "Chatroom User";


  const avatar =
    profile?.avatarURL ||
    "";


  const status =
    profile?.status ||
    "Online";


  return (
    <div
      className="
        flex
        h-[58px]
        shrink-0
        items-center
        gap-3
        border-t
        border-[var(--md-sys-color-outline-variant)]
        bg-[var(--md-sys-color-surface-container-high)]
        px-3
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
            loading
              ? "..."
              : displayName
          }
          size={34}
        />


        <div
          className="
            absolute
            -bottom-[1px]
            -right-[1px]
            rounded-full
            border-[3px]
            border-[var(--md-sys-color-surface-container-high)]
          "
        >
          <UserStatus
            status={
              status
            }
            size="9px"
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
            font-semibold
            text-[var(--md-sys-color-on-surface)]
          "
        >
          {loading
            ? "Loading..."
            : displayName}
        </div>


        <div
          className="
            truncate
            text-[11px]
            text-[var(--md-sys-color-outline)]
          "
        >
          {status}
        </div>
      </div>


      <button
        type="button"
        title="Settings"
        onClick={() =>
          navigate(
            "/settings",
          )
        }
        className="
          grid
          h-9
          w-9
          shrink-0
          place-items-center
          rounded-[var(--borderRadius-sm)]
          text-[var(--md-sys-color-on-surface-variant)]
          transition-colors
          hover:bg-[var(--md-sys-color-surface-container-highest)]
          hover:text-[var(--md-sys-color-on-surface)]
        "
      >
        <Settings
          size={19}
        />
      </button>
    </div>
  );
}


/* =========================================================
   HOME SIDEBAR
   ========================================================= */

export function HomeSidebar() {
  const navigate =
    useNavigate();


  const {
    user,
  } = useAuth();


  const [
    conversations,
    setConversations,
  ] = useState([]);


  const [
    profiles,
    setProfiles,
  ] = useState({});


  const [
    loading,
    setLoading,
  ] = useState(true);


  const [
    error,
    setError,
  ] = useState("");


  const [
    groupModalOpen,
    setGroupModalOpen,
  ] = useState(false);


  /* =========================================================
     ALL CONVERSATIONS
     ========================================================= */

  useEffect(() => {
    if (!user?.uid) {
      setConversations([]);
      setProfiles({});
      setLoading(false);

      return;
    }


    setLoading(true);
    setError("");


    return subscribeToConversations(
      user.uid,

      (
        items,
      ) => {
        setConversations(
          items,
        );

        setLoading(
          false,
        );
      },

      (
        subscriptionError,
      ) => {
        console.error(
          "Unable to load conversations:",
          subscriptionError,
        );


        setError(
          "Unable to load conversations.",
        );

        setLoading(
          false,
        );
      },
    );
  }, [
    user?.uid,
  ]);


  /* =========================================================
     LOAD DM PROFILES
     ========================================================= */

  useEffect(() => {
    if (
      !user?.uid
    ) {
      setProfiles({});

      return;
    }


    const userIds =
      conversations
        .filter(
          (
            conversation,
          ) =>
            conversation.type ===
            "dm",
        )
        .map(
          (
            conversation,
          ) =>
            getOtherDmUserId(
              conversation,
              user.uid,
            ),
        )
        .filter(
          Boolean,
        );


    if (
      userIds.length ===
      0
    ) {
      setProfiles({});

      return;
    }


    let cancelled =
      false;


    async function loadProfiles() {
      try {
        const loaded =
          await getUserProfiles(
            Array.from(
              new Set(
                userIds,
              ),
            ),
          );


        if (
          cancelled
        ) {
          return;
        }


        const next = {};


        for (
          const profile of loaded
        ) {
          next[
            profile.id
          ] = profile;
        }


        setProfiles(
          next,
        );
      } catch (
        profileError
      ) {
        console.error(
          "Unable to load DM profiles:",
          profileError,
        );
      }
    }


    loadProfiles();


    return () => {
      cancelled =
        true;
    };
  }, [
    conversations,
    user?.uid,
  ]);


  /* =========================================================
     PINNED FIRST
     ========================================================= */

  const sortedConversations =
    useMemo(
      () =>
        [
          ...conversations,
        ].sort(
          (
            a,
            b,
          ) => {
            const aPinned =
              isConversationPinned(
                a,
                user?.uid,
              );


            const bPinned =
              isConversationPinned(
                b,
                user?.uid,
              );


            if (
              aPinned !==
              bPinned
            ) {
              return aPinned
                ? -1
                : 1;
            }


            return (
              timestampToMillis(
                b.lastMessageAt ||
                  b.updatedAt,
              ) -
              timestampToMillis(
                a.lastMessageAt ||
                  a.updatedAt,
              )
            );
          },
        ),
      [
        conversations,
        user?.uid,
      ],
    );


  return (
    <>
      <SidebarBase>

        {/* HEADER */}

        <div
          className="
            flex
            h-[64px]
            shrink-0
            items-center
            px-4
          "
        >
          <h1
            className="
              text-base
              font-semibold
              text-[var(--md-sys-color-on-surface)]
            "
          >
            Conversations
          </h1>
        </div>


        {/* MAIN NAV */}

        <div
          className="
            flex
            flex-col
            gap-1
            px-2
          "
        >
          <NavigationItem
            to="/"
            icon={Home}
          >
            Home
          </NavigationItem>


          <NavigationItem
            to="/friends"
            icon={Users}
          >
            Friends
          </NavigationItem>
        </div>


        {/* DIRECT MESSAGES HEADER */}

        <div
          className="
            mt-5
            flex
            items-center
            px-4
            pb-2
          "
        >
          <span
            className="
              min-w-0
              flex-1
              text-[11px]
              font-semibold
              uppercase
              tracking-wide
              text-[var(--md-sys-color-outline)]
            "
          >
            Direct Messages
          </span>


          <button
            type="button"
            title="Create or join group chat"
            onClick={() =>
              setGroupModalOpen(
                true,
              )
            }
            className="
              grid
              h-7
              w-7
              place-items-center
              rounded-md
              text-[var(--md-sys-color-outline)]
              transition-colors
              hover:bg-[var(--md-sys-color-surface-container-highest)]
              hover:text-[var(--md-sys-color-on-surface)]
            "
          >
            <Plus
              size={17}
            />
          </button>
        </div>


        {/* CONVERSATIONS */}

        <div
          className="
            min-h-0
            flex-1
            overflow-y-auto
            px-2
          "
        >
          {loading && (
            <div
              className="
                px-2
                py-4
                text-xs
                text-[var(--md-sys-color-outline)]
              "
            >
              Loading conversations...
            </div>
          )}


          {!loading &&
            error && (
            <div
              className="
                px-2
                py-4
                text-xs
                text-[var(--md-sys-color-error)]
              "
            >
              {error}
            </div>
          )}


          {!loading &&
            !error &&
            sortedConversations
              .length ===
              0 && (
              <div
                className="
                  flex
                  flex-col
                  items-center
                  px-3
                  py-8
                  text-center
                "
              >
                <div
                  className="
                    grid
                    h-10
                    w-10
                    place-items-center
                    rounded-full
                    bg-[var(--md-sys-color-surface-container-highest)]
                    text-[var(--md-sys-color-outline)]
                  "
                >
                  <MessageCircle
                    size={18}
                  />
                </div>


                <div
                  className="
                    mt-3
                    text-xs
                    font-medium
                    text-[var(--md-sys-color-on-surface)]
                  "
                >
                  No conversations
                </div>


                <div
                  className="
                    mt-1
                    text-[11px]
                    leading-4
                    text-[var(--md-sys-color-outline)]
                  "
                >
                  Message a friend or create a group chat.
                </div>
              </div>
            )}


          <div
            className="
              flex
              flex-col
              gap-0.5
            "
          >
            {sortedConversations.map(
              (
                conversation,
              ) => {
                if (
                  conversation.type ===
                  "group"
                ) {
                  return (
                    <GroupConversationItem
                      key={
                        conversation.id
                      }
                      conversation={
                        conversation
                      }
                      currentUid={
                        user?.uid
                      }
                    />
                  );
                }


                if (
                  conversation.type !==
                  "dm"
                ) {
                  return null;
                }


                const otherUid =
                  getOtherDmUserId(
                    conversation,
                    user?.uid,
                  );


                const profile =
                  profiles[
                    otherUid
                  ];


                if (!profile) {
                  return null;
                }


                return (
                  <DirectMessageItem
                    key={
                      conversation.id
                    }
                    conversation={
                      conversation
                    }
                    profile={
                      profile
                    }
                    currentUid={
                      user?.uid
                    }
                  />
                );
              },
            )}
          </div>
        </div>


        <CurrentUser />

      </SidebarBase>


      <CreateGroupModal
        open={
          groupModalOpen
        }
        onClose={() =>
          setGroupModalOpen(
            false,
          )
        }
        onOpenConversation={(
          conversationId,
        ) =>
          navigate(
            `/channel/${conversationId}`,
          )
        }
      />
    </>
  );
}