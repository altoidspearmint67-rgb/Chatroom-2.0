import {
  Check,
  Clock3,
  MessageCircle,
  Search,
  UserMinus,
  UserPlus,
  X,
} from "lucide-react";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  useNavigate,
} from "react-router-dom";

import {
  useAuth,
} from "../auth/AuthContext";

import {
  acceptFriendRequest,
  cancelFriendRequest,
  declineFriendRequest,
  getFriendships,
  getIncomingRequests,
  getOtherUserId,
  getOutgoingRequests,
  getRelationshipId,
  getUserProfiles,
  removeFriend,
  searchUsersByUsername,
  sendFriendRequest,
  subscribeToRelationships,
} from "../firebase/friends";

import {
  createOrOpenDm,
} from "../firebase/conversations";

import {
  Avatar,
  UserStatus,
} from "./ui";


/* =========================================================
   FRIEND ROW
   ========================================================= */

function FriendRow({
  profile,
  relationship,
  type = "friend",

  onAccept,
  onDecline,
  onCancel,
  onRemove,
  onMessage,

  busy = false,
}) {
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


  const title =
    profile?.title ||
    "Member";


  return (
    <div
      className="
        flex
        min-w-0
        items-center
        gap-3

        rounded-[var(--borderRadius-md)]

        px-3
        py-3

        transition-colors

        hover:bg-[var(--md-sys-color-surface-container)]
      "
    >
      {/* AVATAR */}

      <div
        className="
          relative
          shrink-0
        "
      >
        <Avatar
          src={avatarURL}
          fallback={displayName}
          size={42}
        />

        <div
          className="
            absolute
            -bottom-[1px]
            -right-[1px]

            rounded-full

            border-[3px]
            border-[var(--md-sys-color-surface-container-low)]
          "
        >
          <UserStatus
            status={status}
            size="10px"
          />
        </div>
      </div>


      {/* USER INFO */}

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
          {displayName}
        </div>

        <div
          className="
            mt-0.5
            truncate

            text-xs

            text-[var(--md-sys-color-outline)]
          "
        >
          {type === "incoming"
            ? "Incoming Friend Request"
            : type === "outgoing"
              ? "Friend Request Sent"
              : `${title} · ${status}`}
        </div>
      </div>


      {/* FRIEND ACTIONS */}

      {type === "friend" && (
        <div
          className="
            flex
            shrink-0
            items-center
            gap-1
          "
        >
          <button
            type="button"
            title="Message"
            disabled={busy}
            onClick={() =>
              onMessage?.(
                profile,
              )
            }
            className="
              grid
              h-9
              w-9
              place-items-center

              rounded-full

              text-[var(--md-sys-color-on-surface-variant)]

              transition-colors

              hover:bg-[var(--md-sys-color-surface-container-highest)]
              hover:text-[var(--md-sys-color-on-surface)]

              disabled:cursor-not-allowed
              disabled:opacity-40
            "
          >
            <MessageCircle
              size={17}
            />
          </button>


          <button
            type="button"
            title="Remove Friend"
            disabled={busy}
            onClick={() =>
              onRemove?.(
                relationship,
                profile,
              )
            }
            className="
              grid
              h-9
              w-9
              place-items-center

              rounded-full

              text-[var(--md-sys-color-outline)]

              transition-colors

              hover:bg-[var(--md-sys-color-error-container)]
              hover:text-[var(--md-sys-color-on-error-container)]

              disabled:cursor-not-allowed
              disabled:opacity-40
            "
          >
            <UserMinus
              size={17}
            />
          </button>
        </div>
      )}


      {/* INCOMING REQUEST */}

      {type === "incoming" && (
        <div
          className="
            flex
            shrink-0
            items-center
            gap-2
          "
        >
          <button
            type="button"
            title="Accept"
            disabled={busy}
            onClick={() =>
              onAccept?.(
                relationship,
              )
            }
            className="
              grid
              h-9
              w-9
              place-items-center

              rounded-full

              bg-[var(--md-sys-color-primary-container)]

              text-[var(--md-sys-color-on-primary-container)]

              transition

              hover:brightness-110

              disabled:cursor-not-allowed
              disabled:opacity-40
            "
          >
            <Check
              size={17}
            />
          </button>


          <button
            type="button"
            title="Decline"
            disabled={busy}
            onClick={() =>
              onDecline?.(
                relationship,
              )
            }
            className="
              grid
              h-9
              w-9
              place-items-center

              rounded-full

              bg-[var(--md-sys-color-surface-container-highest)]

              text-[var(--md-sys-color-on-surface)]

              transition-colors

              hover:bg-[var(--md-sys-color-error-container)]
              hover:text-[var(--md-sys-color-on-error-container)]

              disabled:cursor-not-allowed
              disabled:opacity-40
            "
          >
            <X
              size={17}
            />
          </button>
        </div>
      )}


      {/* OUTGOING REQUEST */}

      {type === "outgoing" && (
        <button
          type="button"
          disabled={busy}
          onClick={() =>
            onCancel?.(
              relationship,
            )
          }
          className="
            shrink-0

            rounded-[var(--borderRadius-sm)]

            bg-[var(--md-sys-color-surface-container-highest)]

            px-3
            py-2

            text-xs
            font-semibold

            text-[var(--md-sys-color-on-surface)]

            transition-colors

            hover:bg-[var(--md-sys-color-error-container)]
            hover:text-[var(--md-sys-color-on-error-container)]

            disabled:cursor-not-allowed
            disabled:opacity-40
          "
        >
          Cancel
        </button>
      )}
    </div>
  );
}


/* =========================================================
   SEARCH RESULT
   ========================================================= */

function SearchResult({
  profile,
  relationship,
  currentUid,
  onSend,
  onAccept,
  busy,
}) {
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


  let relationshipState =
    "none";


  if (
    relationship?.status ===
    "friends"
  ) {
    relationshipState =
      "friends";
  } else if (
    relationship?.status ===
    "pending"
  ) {
    relationshipState =
      relationship.requestedBy ===
      currentUid
        ? "outgoing"
        : "incoming";
  }


  return (
    <div
      className="
        mt-4

        flex
        min-w-0
        items-center
        gap-3

        rounded-[var(--borderRadius-md)]

        border
        border-[var(--md-sys-color-outline-variant)]

        bg-[var(--md-sys-color-surface-container-low)]

        p-3
      "
    >
      <div
        className="
          relative
          shrink-0
        "
      >
        <Avatar
          src={avatarURL}
          fallback={displayName}
          size={44}
        />

        <div
          className="
            absolute
            -bottom-[1px]
            -right-[1px]

            rounded-full

            border-[3px]
            border-[var(--md-sys-color-surface-container-low)]
          "
        >
          <UserStatus
            status={status}
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
            font-semibold

            text-[var(--md-sys-color-on-surface)]
          "
        >
          {displayName}
        </div>

        <div
          className="
            mt-0.5
            truncate

            text-xs

            text-[var(--md-sys-color-outline)]
          "
        >
          {profile?.title ||
            "Member"}
        </div>
      </div>


      {relationshipState ===
        "none" && (
        <button
          type="button"
          disabled={busy}
          onClick={() =>
            onSend(
              profile,
            )
          }
          className="
            inline-flex
            h-9
            shrink-0
            items-center
            gap-2

            rounded-[var(--borderRadius-sm)]

            bg-[var(--md-sys-color-primary-container)]

            px-3

            text-xs
            font-semibold

            text-[var(--md-sys-color-on-primary-container)]

            transition

            hover:brightness-110

            disabled:cursor-not-allowed
            disabled:opacity-40
          "
        >
          <UserPlus
            size={15}
          />

          Add Friend
        </button>
      )}


      {relationshipState ===
        "outgoing" && (
        <div
          className="
            inline-flex
            shrink-0
            items-center
            gap-1.5

            text-xs

            text-[var(--md-sys-color-outline)]
          "
        >
          <Clock3
            size={15}
          />

          Request Sent
        </div>
      )}


      {relationshipState ===
        "incoming" && (
        <button
          type="button"
          disabled={busy}
          onClick={() =>
            onAccept(
              relationship,
            )
          }
          className="
            inline-flex
            h-9
            shrink-0
            items-center
            gap-2

            rounded-[var(--borderRadius-sm)]

            bg-[var(--md-sys-color-primary-container)]

            px-3

            text-xs
            font-semibold

            text-[var(--md-sys-color-on-primary-container)]

            transition

            hover:brightness-110

            disabled:cursor-not-allowed
            disabled:opacity-40
          "
        >
          <Check
            size={15}
          />

          Accept
        </button>
      )}


      {relationshipState ===
        "friends" && (
        <div
          className="
            shrink-0

            text-xs
            font-semibold

            text-[var(--md-sys-color-primary)]
          "
        >
          Friends
        </div>
      )}
    </div>
  );
}


/* =========================================================
   ONLINE FRIENDS SIDEBAR
   ========================================================= */

function OnlineFriendsSidebar({
  friends,
}) {
  const onlineFriends =
    friends.filter(
      ({ profile }) =>
        String(
          profile?.status ||
            "",
        ).toLowerCase() ===
        "online",
    );


  return (
    <aside
      className="
        w-[260px]
        shrink-0

        overflow-y-auto

        border-l
        border-[var(--md-sys-color-outline-variant)]

        bg-[var(--md-sys-color-surface-container)]

        px-3
        py-5

        max-lg:w-[230px]
        max-md:hidden
      "
    >
      <div
        className="
          mb-3

          px-2

          text-[11px]
          font-semibold
          uppercase
          tracking-wide

          text-[var(--md-sys-color-outline)]
        "
      >
        Online —{" "}
        {onlineFriends.length}
      </div>


      <div
        className="
          flex
          flex-col
          gap-1
        "
      >
        {onlineFriends.length ===
          0 && (
          <div
            className="
              px-2
              py-4

              text-xs

              text-[var(--md-sys-color-outline)]
            "
          >
            No friends are online.
          </div>
        )}


        {onlineFriends.map(
          ({
            profile,
          }) => {
            const name =
              profile.displayName ||
              profile.username ||
              "Unknown User";


            return (
              <div
                key={
                  profile.id
                }
                className="
                  flex
                  items-center
                  gap-3

                  rounded-[var(--borderRadius-sm)]

                  px-2
                  py-2

                  hover:bg-[var(--md-sys-color-surface-container-high)]
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
                      profile.avatarURL ||
                      ""
                    }
                    fallback={
                      name
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
                      border-[var(--md-sys-color-surface-container)]
                    "
                  >
                    <UserStatus
                      status="Online"
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
                      font-medium

                      text-[var(--md-sys-color-on-surface)]
                    "
                  >
                    {name}
                  </div>

                  <div
                    className="
                      truncate

                      text-[11px]

                      text-[var(--md-sys-color-outline)]
                    "
                  >
                    {profile.title ||
                      "Member"}
                  </div>
                </div>
              </div>
            );
          },
        )}
      </div>
    </aside>
  );
}


/* =========================================================
   EMPTY STATE
   ========================================================= */

function EmptyState({
  title,
  description,
}) {
  return (
    <div
      className="
        flex
        min-h-[280px]
        flex-col
        items-center
        justify-center

        px-6

        text-center
      "
    >
      <div
        className="
          grid
          h-12
          w-12
          place-items-center

          rounded-full

          bg-[var(--md-sys-color-surface-container-highest)]

          text-[var(--md-sys-color-outline)]
        "
      >
        <UserPlus
          size={21}
        />
      </div>

      <div
        className="
          mt-4

          text-sm
          font-semibold

          text-[var(--md-sys-color-on-surface)]
        "
      >
        {title}
      </div>

      <div
        className="
          mt-1
          max-w-[380px]

          text-xs
          leading-5

          text-[var(--md-sys-color-outline)]
        "
      >
        {description}
      </div>
    </div>
  );
}


/* =========================================================
   FRIENDS PAGE
   ========================================================= */

export function Friends() {
  const navigate =
    useNavigate();


  const {
    user,
  } = useAuth();


  const [
    activeTab,
    setActiveTab,
  ] = useState("all");


  const [
    relationships,
    setRelationships,
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
    actionId,
    setActionId,
  ] = useState(null);


  const [
    error,
    setError,
  ] = useState("");


  const [
    success,
    setSuccess,
  ] = useState("");


  /* =========================================================
     ADD FRIEND SEARCH
     ========================================================= */

  const [
    addFriendOpen,
    setAddFriendOpen,
  ] = useState(false);


  const [
    searchValue,
    setSearchValue,
  ] = useState("");


  const [
    searching,
    setSearching,
  ] = useState(false);


  const [
    searchResults,
    setSearchResults,
  ] = useState([]);


  const [
    searchPerformed,
    setSearchPerformed,
  ] = useState(false);


  /* =========================================================
     FRIEND LIST SEARCH
     ========================================================= */

  const [
    friendFilter,
    setFriendFilter,
  ] = useState("");


  /* =========================================================
     LIVE RELATIONSHIPS
     ========================================================= */

  useEffect(() => {
    if (!user?.uid) {
      setRelationships([]);
      setProfiles({});
      setLoading(false);

      return;
    }


    setLoading(true);


    const unsubscribe =
      subscribeToRelationships(
        user.uid,

        (items) => {
          setRelationships(
            items,
          );

          setLoading(false);
        },

        () => {
          setError(
            "Unable to load friends.",
          );

          setLoading(false);
        },
      );


    return unsubscribe;
  }, [
    user?.uid,
  ]);


  /* =========================================================
     LOAD PROFILES
     ========================================================= */

  useEffect(() => {
    if (
      !user?.uid ||
      relationships.length ===
        0
    ) {
      setProfiles({});

      return;
    }


    let cancelled =
      false;


    async function loadProfiles() {
      const userIds =
        relationships
          .map(
            (
              relationship,
            ) =>
              getOtherUserId(
                relationship,
                user.uid,
              ),
          )
          .filter(Boolean);


      try {
        const loaded =
          await getUserProfiles(
            userIds,
          );


        if (cancelled) {
          return;
        }


        const nextProfiles =
          {};


        for (
          const profile of loaded
        ) {
          nextProfiles[
            profile.id
          ] = profile;
        }


        setProfiles(
          nextProfiles,
        );
      } catch (err) {
        console.error(
          "Profile loading failed:",
          err,
        );
      }
    }


    loadProfiles();


    return () => {
      cancelled =
        true;
    };
  }, [
    relationships,
    user?.uid,
  ]);


  /* =========================================================
     DERIVED DATA
     ========================================================= */

  const friendships =
    useMemo(
      () =>
        getFriendships(
          relationships,
        ),
      [
        relationships,
      ],
    );


  const incomingRequests =
    useMemo(
      () =>
        getIncomingRequests(
          relationships,
          user?.uid,
        ),
      [
        relationships,
        user?.uid,
      ],
    );


  const outgoingRequests =
    useMemo(
      () =>
        getOutgoingRequests(
          relationships,
          user?.uid,
        ),
      [
        relationships,
        user?.uid,
      ],
    );


  const friendRows =
    useMemo(
      () =>
        friendships
          .map(
            (
              relationship,
            ) => {
              const otherUid =
                getOtherUserId(
                  relationship,
                  user?.uid,
                );


              return {
                relationship,

                profile:
                  profiles[
                    otherUid
                  ],
              };
            },
          )
          .filter(
            ({ profile }) =>
              Boolean(profile),
          ),
      [
        friendships,
        profiles,
        user?.uid,
      ],
    );


  const filteredFriends =
    useMemo(
      () => {
        const filter =
          friendFilter
            .trim()
            .toLowerCase();


        if (!filter) {
          return friendRows;
        }


        return friendRows.filter(
          ({ profile }) => {
            const name =
              String(
                profile.username ||
                  profile.displayName ||
                  "",
              ).toLowerCase();


            return name.includes(
              filter,
            );
          },
        );
      },
      [
        friendRows,
        friendFilter,
      ],
    );


  /* =========================================================
     SEARCH USERS
     ========================================================= */

  async function handleUserSearch(
    event,
  ) {
    event.preventDefault();


    const value =
      searchValue.trim();


    setError("");
    setSuccess("");
    setSearchPerformed(
      true,
    );


    if (!value) {
      setSearchResults([]);

      return;
    }


    if (!user?.uid) {
      return;
    }


    setSearching(
      true,
    );


    try {
      const results =
        await searchUsersByUsername(
          value,
          user.uid,
        );


      setSearchResults(
        results,
      );
    } catch (err) {
      console.error(
        "User search failed:",
        err,
      );


      setError(
        "Unable to search for users.",
      );
    } finally {
      setSearching(
        false,
      );
    }
  }


  /* =========================================================
     FIND RELATIONSHIP
     ========================================================= */

  function relationshipForUser(
    targetUid,
  ) {
    if (
      !user?.uid ||
      !targetUid
    ) {
      return null;
    }


    const id =
      getRelationshipId(
        user.uid,
        targetUid,
      );


    return (
      relationships.find(
        (relationship) =>
          relationship.id ===
          id,
      ) ||
      null
    );
  }


  /* =========================================================
     SEND FRIEND REQUEST
     ========================================================= */

  async function handleSendRequest(
    profile,
  ) {
    if (
      !user?.uid ||
      !profile?.id
    ) {
      return;
    }


    setActionId(
      profile.id,
    );

    setError("");
    setSuccess("");


    try {
      await sendFriendRequest(
        user.uid,
        profile.id,
      );


      setSuccess(
        `Friend request sent to ${
          profile.displayName ||
          profile.username
        }.`,
      );
    } catch (err) {
      console.error(err);


      setError(
        err?.message ||
          "Unable to send friend request.",
      );
    } finally {
      setActionId(
        null,
      );
    }
  }


  /* =========================================================
     ACCEPT
     ========================================================= */

  async function handleAccept(
    relationship,
  ) {
    if (!user?.uid) {
      return;
    }


    setActionId(
      relationship.id,
    );

    setError("");
    setSuccess("");


    try {
      await acceptFriendRequest(
        relationship.id,
        user.uid,
      );


      setSuccess(
        "Friend request accepted.",
      );
    } catch (err) {
      console.error(err);


      setError(
        err?.message ||
          "Unable to accept friend request.",
      );
    } finally {
      setActionId(
        null,
      );
    }
  }


  /* =========================================================
     DECLINE
     ========================================================= */

  async function handleDecline(
    relationship,
  ) {
    setActionId(
      relationship.id,
    );

    setError("");
    setSuccess("");


    try {
      await declineFriendRequest(
        relationship.id,
      );
    } catch (err) {
      console.error(err);


      setError(
        err?.message ||
          "Unable to decline friend request.",
      );
    } finally {
      setActionId(
        null,
      );
    }
  }


  /* =========================================================
     CANCEL
     ========================================================= */

  async function handleCancel(
    relationship,
  ) {
    setActionId(
      relationship.id,
    );

    setError("");
    setSuccess("");


    try {
      await cancelFriendRequest(
        relationship.id,
      );
    } catch (err) {
      console.error(err);


      setError(
        err?.message ||
          "Unable to cancel friend request.",
      );
    } finally {
      setActionId(
        null,
      );
    }
  }


  /* =========================================================
     REMOVE FRIEND
     ========================================================= */

  async function handleRemove(
    relationship,
    profile,
  ) {
    const name =
      profile?.displayName ||
      profile?.username ||
      "this user";


    const confirmed =
      window.confirm(
        `Remove ${name} from your friends?`,
      );


    if (!confirmed) {
      return;
    }


    setActionId(
      relationship.id,
    );

    setError("");
    setSuccess("");


    try {
      await removeFriend(
        relationship.id,
      );
    } catch (err) {
      console.error(err);


      setError(
        err?.message ||
          "Unable to remove friend.",
      );
    } finally {
      setActionId(
        null,
      );
    }
  }


  /* =========================================================
     OPEN REAL DIRECT MESSAGE
     ========================================================= */

  async function handleMessage(
    profile,
  ) {
    if (
      !user?.uid ||
      !profile?.id
    ) {
      return;
    }


    setActionId(
      profile.id,
    );

    setError("");
    setSuccess("");


    try {
      /*
       * Creates the DM if it doesn't
       * exist, or opens the existing one.
       */
      const conversationId =
        await createOrOpenDm(
          user.uid,
          profile.id,
        );


      /*
       * Our router already uses:
       *
       * /channel/:channel/*
       */
      navigate(
        `/channel/${conversationId}`,
      );
    } catch (err) {
      console.error(
        "Unable to open DM:",
        err,
      );


      setError(
        err?.message ||
          "Unable to open direct message.",
      );
    } finally {
      setActionId(
        null,
      );
    }
  }


  /* =========================================================
     PAGE
     ========================================================= */

  return (
    <div
      className="
        flex
        min-h-0
        min-w-0
        flex-1

        bg-[var(--md-sys-color-surface-container-low)]
      "
    >

      {/* MAIN AREA */}

      <div
        className="
          flex
          min-h-0
          min-w-0
          flex-1
          flex-col
        "
      >

        {/* HEADER */}

        <header
          className="
            flex
            min-h-[64px]
            shrink-0
            items-center
            gap-2

            border-b
            border-[var(--md-sys-color-outline-variant)]

            px-5

            max-sm:px-3
          "
        >
          <div
            className="
              mr-3

              text-sm
              font-semibold

              text-[var(--md-sys-color-on-surface)]
            "
          >
            Friends
          </div>


          <button
            type="button"
            onClick={() =>
              setActiveTab(
                "all",
              )
            }
            className={[
              "rounded-md",
              "px-3",
              "py-2",
              "text-xs",
              "font-medium",
              "transition-colors",

              activeTab ===
              "all"
                ? [
                    "bg-[var(--md-sys-color-surface-container-highest)]",
                    "text-[var(--md-sys-color-on-surface)]",
                  ].join(" ")
                : [
                    "text-[var(--md-sys-color-outline)]",
                    "hover:text-[var(--md-sys-color-on-surface)]",
                  ].join(" "),
            ].join(" ")}
          >
            All
          </button>


          <button
            type="button"
            onClick={() =>
              setActiveTab(
                "pending",
              )
            }
            className={[
              "rounded-md",
              "px-3",
              "py-2",
              "text-xs",
              "font-medium",
              "transition-colors",

              activeTab ===
              "pending"
                ? [
                    "bg-[var(--md-sys-color-surface-container-highest)]",
                    "text-[var(--md-sys-color-on-surface)]",
                  ].join(" ")
                : [
                    "text-[var(--md-sys-color-outline)]",
                    "hover:text-[var(--md-sys-color-on-surface)]",
                  ].join(" "),
            ].join(" ")}
          >
            Pending

            {incomingRequests.length >
              0 && (
              <span
                className="
                  ml-1.5

                  rounded-full

                  bg-[var(--md-sys-color-error)]

                  px-1.5
                  py-0.5

                  text-[9px]
                  font-bold

                  text-[var(--md-sys-color-on-error)]
                "
              >
                {
                  incomingRequests.length
                }
              </span>
            )}
          </button>


          <button
            type="button"
            onClick={() =>
              setActiveTab(
                "blocked",
              )
            }
            className={[
              "rounded-md",
              "px-3",
              "py-2",
              "text-xs",
              "font-medium",
              "transition-colors",

              activeTab ===
              "blocked"
                ? [
                    "bg-[var(--md-sys-color-surface-container-highest)]",
                    "text-[var(--md-sys-color-on-surface)]",
                  ].join(" ")
                : [
                    "text-[var(--md-sys-color-outline)]",
                    "hover:text-[var(--md-sys-color-on-surface)]",
                  ].join(" "),
            ].join(" ")}
          >
            Blocked
          </button>


          <div className="flex-1" />


          <button
            type="button"
            onClick={() =>
              setAddFriendOpen(
                (value) =>
                  !value,
              )
            }
            className="
              inline-flex
              h-9
              shrink-0
              items-center
              gap-2

              rounded-[var(--borderRadius-sm)]

              bg-[var(--md-sys-color-primary-container)]

              px-3

              text-xs
              font-semibold

              text-[var(--md-sys-color-on-primary-container)]

              transition

              hover:brightness-110
            "
          >
            <UserPlus
              size={15}
            />

            <span
              className="
                max-sm:hidden
              "
            >
              Add Friend
            </span>
          </button>
        </header>


        {/* ADD FRIEND */}

        {addFriendOpen && (
          <div
            className="
              shrink-0

              border-b
              border-[var(--md-sys-color-outline-variant)]

              bg-[var(--md-sys-color-surface-container)]

              p-5

              max-sm:p-3
            "
          >
            <div
              className="
                text-sm
                font-semibold

                text-[var(--md-sys-color-on-surface)]
              "
            >
              Add Friend
            </div>

            <div
              className="
                mt-1

                text-xs

                text-[var(--md-sys-color-outline)]
              "
            >
              Search for someone by their exact username.
            </div>


            <form
              onSubmit={
                handleUserSearch
              }
              className="
                mt-4

                flex
                gap-2
              "
            >
              <div
                className="
                  relative
                  min-w-0
                  flex-1
                "
              >
                <Search
                  size={17}
                  className="
                    pointer-events-none

                    absolute
                    left-3
                    top-1/2

                    -translate-y-1/2

                    text-[var(--md-sys-color-outline)]
                  "
                />

                <input
                  type="text"
                  value={
                    searchValue
                  }
                  placeholder="Enter a username"
                  onChange={(event) => {
                    setSearchValue(
                      event.target
                        .value,
                    );

                    setSearchPerformed(
                      false,
                    );

                    setSearchResults(
                      [],
                    );
                  }}
                  className="
                    h-11
                    w-full

                    rounded-[var(--borderRadius-sm)]

                    border
                    border-[var(--md-sys-color-outline-variant)]

                    bg-[var(--md-sys-color-surface-container-low)]

                    pl-10
                    pr-3

                    text-sm

                    text-[var(--md-sys-color-on-surface)]

                    outline-none

                    placeholder:text-[var(--md-sys-color-outline)]

                    focus:border-[var(--md-sys-color-primary)]
                  "
                />
              </div>


              <button
                type="submit"
                disabled={
                  searching
                }
                className="
                  h-11
                  shrink-0

                  rounded-[var(--borderRadius-sm)]

                  bg-[var(--md-sys-color-primary-container)]

                  px-4

                  text-xs
                  font-semibold

                  text-[var(--md-sys-color-on-primary-container)]

                  transition

                  hover:brightness-110

                  disabled:opacity-50
                "
              >
                {searching
                  ? "Searching..."
                  : "Search"}
              </button>
            </form>


            {searchPerformed &&
              !searching &&
              searchResults.length ===
                0 && (
                <div
                  className="
                    mt-4

                    text-xs

                    text-[var(--md-sys-color-outline)]
                  "
                >
                  No user found with that username.
                </div>
              )}


            {searchResults.map(
              (profile) => (
                <SearchResult
                  key={
                    profile.id
                  }
                  profile={
                    profile
                  }
                  currentUid={
                    user?.uid
                  }
                  relationship={
                    relationshipForUser(
                      profile.id,
                    )
                  }
                  busy={
                    actionId ===
                    profile.id
                  }
                  onSend={
                    handleSendRequest
                  }
                  onAccept={
                    handleAccept
                  }
                />
              ),
            )}
          </div>
        )}


        {/* SUCCESS */}

        {success && (
          <div
            className="
              mx-5
              mt-4

              rounded-[var(--borderRadius-sm)]

              bg-[var(--md-sys-color-primary-container)]

              px-4
              py-3

              text-xs

              text-[var(--md-sys-color-on-primary-container)]

              max-sm:mx-3
            "
          >
            {success}
          </div>
        )}


        {/* ERROR */}

        {error && (
          <div
            className="
              mx-5
              mt-4

              rounded-[var(--borderRadius-sm)]

              bg-[var(--md-sys-color-error-container)]

              px-4
              py-3

              text-xs

              text-[var(--md-sys-color-on-error-container)]

              max-sm:mx-3
            "
          >
            {error}
          </div>
        )}


        {/* CONTENT */}

        <div
          className="
            min-h-0
            flex-1

            overflow-y-auto

            px-5
            py-4

            max-sm:px-3
          "
        >
          {loading ? (
            <div
              className="
                py-12
                text-center

                text-sm

                text-[var(--md-sys-color-outline)]
              "
            >
              Loading friends...
            </div>
          ) : (
            <>
              {/* ALL FRIENDS */}

              {activeTab ===
                "all" && (
                <>
                  <div
                    className="
                      relative
                      mb-4
                    "
                  >
                    <Search
                      size={16}
                      className="
                        pointer-events-none

                        absolute
                        left-3
                        top-1/2

                        -translate-y-1/2

                        text-[var(--md-sys-color-outline)]
                      "
                    />

                    <input
                      type="text"
                      value={
                        friendFilter
                      }
                      placeholder="Search friends"
                      onChange={(event) =>
                        setFriendFilter(
                          event.target
                            .value,
                        )
                      }
                      className="
                        h-10
                        w-full

                        rounded-[var(--borderRadius-sm)]

                        border
                        border-[var(--md-sys-color-outline-variant)]

                        bg-[var(--md-sys-color-surface-container)]

                        pl-10
                        pr-3

                        text-sm

                        text-[var(--md-sys-color-on-surface)]

                        outline-none

                        placeholder:text-[var(--md-sys-color-outline)]

                        focus:border-[var(--md-sys-color-primary)]
                      "
                    />
                  </div>


                  <div
                    className="
                      mb-2

                      px-3

                      text-[11px]
                      font-semibold
                      uppercase
                      tracking-wide

                      text-[var(--md-sys-color-outline)]
                    "
                  >
                    All Friends —{" "}
                    {
                      filteredFriends.length
                    }
                  </div>


                  {filteredFriends.length ===
                    0 ? (
                    <EmptyState
                      title="No friends yet"
                      description="Use Add Friend to search for another Chatroom user."
                    />
                  ) : (
                    <div
                      className="
                        flex
                        flex-col
                      "
                    >
                      {filteredFriends.map(
                        ({
                          relationship,
                          profile,
                        }) => (
                          <FriendRow
                            key={
                              relationship.id
                            }
                            type="friend"
                            profile={
                              profile
                            }
                            relationship={
                              relationship
                            }
                            busy={
                              actionId ===
                                relationship.id ||
                              actionId ===
                                profile.id
                            }
                            onMessage={
                              handleMessage
                            }
                            onRemove={
                              handleRemove
                            }
                          />
                        ),
                      )}
                    </div>
                  )}
                </>
              )}


              {/* PENDING */}

              {activeTab ===
                "pending" && (
                <div>
                  <div
                    className="
                      mb-2

                      px-3

                      text-[11px]
                      font-semibold
                      uppercase
                      tracking-wide

                      text-[var(--md-sys-color-outline)]
                    "
                  >
                    Incoming —{" "}
                    {
                      incomingRequests.length
                    }
                  </div>


                  {incomingRequests.map(
                    (
                      relationship,
                    ) => {
                      const uid =
                        getOtherUserId(
                          relationship,
                          user.uid,
                        );

                      const profile =
                        profiles[
                          uid
                        ];


                      if (!profile) {
                        return null;
                      }


                      return (
                        <FriendRow
                          key={
                            relationship.id
                          }
                          type="incoming"
                          profile={
                            profile
                          }
                          relationship={
                            relationship
                          }
                          busy={
                            actionId ===
                            relationship.id
                          }
                          onAccept={
                            handleAccept
                          }
                          onDecline={
                            handleDecline
                          }
                        />
                      );
                    },
                  )}


                  {incomingRequests.length ===
                    0 && (
                    <div
                      className="
                        px-3
                        py-4

                        text-xs

                        text-[var(--md-sys-color-outline)]
                      "
                    >
                      No incoming requests.
                    </div>
                  )}


                  <div
                    className="
                      mb-2
                      mt-6

                      px-3

                      text-[11px]
                      font-semibold
                      uppercase
                      tracking-wide

                      text-[var(--md-sys-color-outline)]
                    "
                  >
                    Sent —{" "}
                    {
                      outgoingRequests.length
                    }
                  </div>


                  {outgoingRequests.map(
                    (
                      relationship,
                    ) => {
                      const uid =
                        getOtherUserId(
                          relationship,
                          user.uid,
                        );

                      const profile =
                        profiles[
                          uid
                        ];


                      if (!profile) {
                        return null;
                      }


                      return (
                        <FriendRow
                          key={
                            relationship.id
                          }
                          type="outgoing"
                          profile={
                            profile
                          }
                          relationship={
                            relationship
                          }
                          busy={
                            actionId ===
                            relationship.id
                          }
                          onCancel={
                            handleCancel
                          }
                        />
                      );
                    },
                  )}


                  {outgoingRequests.length ===
                    0 && (
                    <div
                      className="
                        px-3
                        py-4

                        text-xs

                        text-[var(--md-sys-color-outline)]
                      "
                    >
                      No outgoing requests.
                    </div>
                  )}
                </div>
              )}


              {/* BLOCKED */}

              {activeTab ===
                "blocked" && (
                <EmptyState
                  title="No blocked users"
                  description="You haven't blocked anyone."
                />
              )}
            </>
          )}
        </div>
      </div>


      {/* ONLINE FRIENDS */}

      <OnlineFriendsSidebar
        friends={
          friendRows
        }
      />
    </div>
  );
}