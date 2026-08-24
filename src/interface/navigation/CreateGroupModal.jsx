import {
  Check,
  Copy,
  Hash,
  KeyRound,
  Search,
  UsersRound,
  X,
} from "lucide-react";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  useAuth,
} from "../../auth/AuthContext";

import {
  getFriendships,
  getOtherUserId,
  getUserProfiles,
  subscribeToRelationships,
} from "../../firebase/friends";

import {
  createGroupChat,
  joinGroupByCode,
  normalizeGroupCode,
} from "../../firebase/conversations";

import {
  Avatar,
} from "../ui";


export function CreateGroupModal({
  open,
  onClose,
  onOpenConversation,
}) {
  const {
    user,
  } = useAuth();


  const [
    mode,
    setMode,
  ] = useState(
    "create",
  );


  const [
    relationships,
    setRelationships,
  ] = useState([]);


  const [
    friendProfiles,
    setFriendProfiles,
  ] = useState([]);


  const [
    friendsLoading,
    setFriendsLoading,
  ] = useState(false);


  const [
    groupName,
    setGroupName,
  ] = useState("");


  const [
    selectedIds,
    setSelectedIds,
  ] = useState([]);


  const [
    search,
    setSearch,
  ] = useState("");


  const [
    joinCode,
    setJoinCode,
  ] = useState("");


  const [
    loading,
    setLoading,
  ] = useState(false);


  const [
    error,
    setError,
  ] = useState("");


  const [
    createdGroup,
    setCreatedGroup,
  ] = useState(null);


  const [
    copied,
    setCopied,
  ] = useState(false);


  /* =========================================================
     RESET WHEN CLOSED
     ========================================================= */

  useEffect(() => {
    if (open) {
      return;
    }


    setMode(
      "create",
    );

    setGroupName("");
    setSelectedIds([]);
    setSearch("");
    setJoinCode("");
    setError("");
    setCreatedGroup(null);
    setCopied(false);
  }, [
    open,
  ]);


  /* =========================================================
     ESCAPE TO CLOSE
     ========================================================= */

  useEffect(() => {
    if (!open) {
      return;
    }


    function onKeyDown(
      event,
    ) {
      if (
        event.key ===
        "Escape"
      ) {
        onClose?.();
      }
    }


    window.addEventListener(
      "keydown",
      onKeyDown,
    );


    return () =>
      window.removeEventListener(
        "keydown",
        onKeyDown,
      );
  }, [
    open,
    onClose,
  ]);


  /* =========================================================
     FRIEND RELATIONSHIPS
     ========================================================= */

  useEffect(() => {
    if (
      !open ||
      !user?.uid
    ) {
      setRelationships([]);

      return;
    }


    return subscribeToRelationships(
      user.uid,

      (
        items,
      ) => {
        setRelationships(
          items,
        );
      },

      (
        relationshipError,
      ) => {
        console.error(
          "Unable to load relationships:",
          relationshipError,
        );
      },
    );
  }, [
    open,
    user?.uid,
  ]);


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


  const friendIds =
    useMemo(
      () =>
        friendships
          .map(
            (
              relationship,
            ) =>
              getOtherUserId(
                relationship,
                user?.uid,
              ),
          )
          .filter(
            Boolean,
          ),
      [
        friendships,
        user?.uid,
      ],
    );


  /* =========================================================
     FRIEND PROFILES
     ========================================================= */

  useEffect(() => {
    if (
      !open ||
      friendIds.length ===
        0
    ) {
      setFriendProfiles([]);
      setFriendsLoading(false);

      return;
    }


    let cancelled =
      false;


    setFriendsLoading(
      true,
    );


    async function loadFriends() {
      try {
        const loaded =
          await getUserProfiles(
            friendIds,
          );


        if (
          !cancelled
        ) {
          setFriendProfiles(
            loaded,
          );
        }
      } catch (loadError) {
        console.error(
          "Unable to load friends:",
          loadError,
        );
      } finally {
        if (
          !cancelled
        ) {
          setFriendsLoading(
            false,
          );
        }
      }
    }


    loadFriends();


    return () => {
      cancelled =
        true;
    };
  }, [
    open,
    friendIds.join("|"),
  ]);


  /* =========================================================
     FILTER FRIENDS
     ========================================================= */

  const filteredFriends =
    useMemo(
      () => {
        const needle =
          search
            .trim()
            .toLowerCase();


        if (!needle) {
          return friendProfiles;
        }


        return friendProfiles.filter(
          (
            profile,
          ) =>
            (
              profile.displayName ||
              ""
            )
              .toLowerCase()
              .includes(
                needle,
              ) ||
            (
              profile.username ||
              ""
            )
              .toLowerCase()
              .includes(
                needle,
              ),
        );
      },
      [
        friendProfiles,
        search,
      ],
    );


  function toggleFriend(
    userId,
  ) {
    setSelectedIds(
      (
        current,
      ) =>
        current.includes(
          userId,
        )
          ? current.filter(
              (
                id,
              ) =>
                id !==
                userId,
            )
          : [
              ...current,
              userId,
            ],
    );
  }


  /* =========================================================
     CREATE GROUP
     ========================================================= */

  async function handleCreate() {
    if (
      !user?.uid ||
      loading
    ) {
      return;
    }


    const cleanName =
      groupName.trim();


    if (!cleanName) {
      setError(
        "Enter a group name.",
      );

      return;
    }


    setLoading(true);
    setError("");


    try {
      const result =
        await createGroupChat({
          ownerId:
            user.uid,

          name:
            cleanName,

          memberIds:
            selectedIds,
        });


      setCreatedGroup({
        ...result,

        name:
          cleanName,
      });
    } catch (createError) {
      console.error(
        "Unable to create group:",
        createError,
      );


      setError(
        createError?.message ||
        "Unable to create group.",
      );
    } finally {
      setLoading(
        false,
      );
    }
  }


  /* =========================================================
     JOIN GROUP
     ========================================================= */

  async function handleJoin() {
    if (
      !user?.uid ||
      loading
    ) {
      return;
    }


    setLoading(true);
    setError("");


    try {
      const conversationId =
        await joinGroupByCode({
          userId:
            user.uid,

          code:
            joinCode,
        });


      onClose?.();

      onOpenConversation?.(
        conversationId,
      );
    } catch (joinError) {
      console.error(
        "Unable to join group:",
        joinError,
      );


      setError(
        joinError?.message ||
        "Unable to join group.",
      );
    } finally {
      setLoading(
        false,
      );
    }
  }


  async function copyCode() {
    if (
      !createdGroup
        ?.joinCode
    ) {
      return;
    }


    try {
      await navigator.clipboard.writeText(
        createdGroup.joinCode,
      );


      setCopied(
        true,
      );


      window.setTimeout(
        () =>
          setCopied(
            false,
          ),
        1500,
      );
    } catch {
      setCopied(
        false,
      );
    }
  }


  if (!open) {
    return null;
  }


  return (
    <div
      className="
        fixed
        inset-0
        z-[100]
        flex
        items-center
        justify-center
        bg-black/60
        p-4
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
          flex
          max-h-[80vh]
          w-full
          max-w-[480px]
          flex-col
          overflow-hidden
          rounded-2xl
          border
          border-white/8
          bg-[var(--md-sys-color-surface-container-high)]
          shadow-2xl
        "
      >
        {/* HEADER */}

        <div
          className="
            flex
            h-14
            shrink-0
            items-center
            border-b
            border-white/5
            px-5
          "
        >
          <div
            className="
              min-w-0
              flex-1
            "
          >
            <div
              className="
                text-base
                font-semibold
                text-[var(--md-sys-color-on-surface)]
              "
            >
              Group Chats
            </div>
          </div>


          <button
            type="button"
            title="Close"
            onClick={
              onClose
            }
            className="
              grid
              h-9
              w-9
              place-items-center
              rounded-lg
              text-[var(--md-sys-color-outline)]
              hover:bg-white/7
              hover:text-white
            "
          >
            <X
              size={18}
            />
          </button>
        </div>


        {createdGroup ? (
          /* =================================================
             CREATED SUCCESS
             ================================================= */

          <div
            className="
              p-6
              text-center
            "
          >
            <div
              className="
                mx-auto
                grid
                h-12
                w-12
                place-items-center
                rounded-full
                bg-[var(--md-sys-color-primary-container)]
                text-[var(--md-sys-color-on-primary-container)]
              "
            >
              <UsersRound
                size={22}
              />
            </div>


            <div
              className="
                mt-4
                text-lg
                font-semibold
                text-white
              "
            >
              {createdGroup.name}
            </div>


            <div
              className="
                mt-1
                text-sm
                text-white/45
              "
            >
              Group created successfully.
            </div>


            <div
              className="
                mt-6
                text-[11px]
                font-semibold
                uppercase
                tracking-wide
                text-white/35
              "
            >
              Join Code
            </div>


            <button
              type="button"
              onClick={
                copyCode
              }
              className="
                mx-auto
                mt-2
                flex
                items-center
                gap-3
                rounded-xl
                bg-white/5
                px-5
                py-3
                hover:bg-white/8
              "
            >
              <span
                className="
                  font-mono
                  text-xl
                  font-bold
                  tracking-[0.2em]
                  text-white
                "
              >
                {
                  createdGroup.joinCode
                }
              </span>


              {copied ? (
                <Check
                  size={17}
                  className="text-green-300"
                />
              ) : (
                <Copy
                  size={17}
                  className="text-white/40"
                />
              )}
            </button>


            <div
              className="
                mt-2
                text-xs
                text-white/30
              "
            >
              Share this code with anyone you want to invite.
            </div>


            <button
              type="button"
              onClick={() => {
                const id =
                  createdGroup.conversationId;

                onClose?.();

                onOpenConversation?.(
                  id,
                );
              }}
              className="
                mt-6
                h-10
                w-full
                rounded-xl
                bg-[var(--md-sys-color-primary-container)]
                text-sm
                font-semibold
                text-[var(--md-sys-color-on-primary-container)]
              "
            >
              Open Group
            </button>
          </div>
        ) : (
          <>
            {/* MODE SELECTOR */}

            <div
              className="
                grid
                grid-cols-2
                gap-2
                p-4
                pb-0
              "
            >
              <button
                type="button"
                onClick={() => {
                  setMode(
                    "create",
                  );

                  setError("");
                }}
                className={[
                  "flex h-10 items-center justify-center gap-2 rounded-xl text-sm font-medium transition",

                  mode ===
                  "create"
                    ? "bg-[var(--md-sys-color-primary-container)] text-[var(--md-sys-color-on-primary-container)]"
                    : "bg-white/4 text-white/50 hover:bg-white/7 hover:text-white",
                ].join(" ")}
              >
                <UsersRound
                  size={17}
                />

                Create Group
              </button>


              <button
                type="button"
                onClick={() => {
                  setMode(
                    "join",
                  );

                  setError("");
                }}
                className={[
                  "flex h-10 items-center justify-center gap-2 rounded-xl text-sm font-medium transition",

                  mode ===
                  "join"
                    ? "bg-[var(--md-sys-color-primary-container)] text-[var(--md-sys-color-on-primary-container)]"
                    : "bg-white/4 text-white/50 hover:bg-white/7 hover:text-white",
                ].join(" ")}
              >
                <KeyRound
                  size={17}
                />

                Join with Code
              </button>
            </div>


            {mode ===
              "create" ? (
              /* =============================================
                 CREATE
                 ============================================= */

              <div
                className="
                  min-h-0
                  overflow-y-auto
                  p-4
                "
              >
                <label
                  className="
                    text-xs
                    font-semibold
                    text-white/55
                  "
                >
                  Group name
                </label>


                <input
                  value={
                    groupName
                  }
                  maxLength={50}
                  autoFocus
                  onChange={(
                    event,
                  ) =>
                    setGroupName(
                      event.target
                        .value,
                    )
                  }
                  placeholder="Enter a group name"
                  className="
                    mt-2
                    h-11
                    w-full
                    rounded-xl
                    border
                    border-white/8
                    bg-black/15
                    px-3
                    text-sm
                    text-white
                    outline-none
                    placeholder:text-white/25
                    focus:border-[var(--md-sys-color-primary)]
                  "
                />


                <div
                  className="
                    mt-5
                    flex
                    items-center
                  "
                >
                  <div
                    className="
                      min-w-0
                      flex-1
                    "
                  >
                    <div
                      className="
                        text-xs
                        font-semibold
                        text-white/55
                      "
                    >
                      Add friends
                    </div>

                    <div
                      className="
                        mt-0.5
                        text-[11px]
                        text-white/30
                      "
                    >
                      Optional — people can also join with the group code.
                    </div>
                  </div>


                  {selectedIds.length >
                    0 && (
                    <div
                      className="
                        text-xs
                        text-white/40
                      "
                    >
                      {
                        selectedIds.length
                      }{" "}
                      selected
                    </div>
                  )}
                </div>


                {friendProfiles.length >
                  0 && (
                  <div
                    className="
                      relative
                      mt-3
                    "
                  >
                    <Search
                      size={15}
                      className="
                        absolute
                        left-3
                        top-1/2
                        -translate-y-1/2
                        text-white/30
                      "
                    />

                    <input
                      value={
                        search
                      }
                      onChange={(
                        event,
                      ) =>
                        setSearch(
                          event.target
                            .value,
                        )
                      }
                      placeholder="Search friends"
                      className="
                        h-10
                        w-full
                        rounded-xl
                        border
                        border-white/8
                        bg-black/15
                        pl-9
                        pr-3
                        text-sm
                        text-white
                        outline-none
                        placeholder:text-white/25
                      "
                    />
                  </div>
                )}


                <div
                  className="
                    mt-3
                    max-h-[245px]
                    overflow-y-auto
                  "
                >
                  {friendsLoading && (
                    <div
                      className="
                        py-6
                        text-center
                        text-xs
                        text-white/35
                      "
                    >
                      Loading friends...
                    </div>
                  )}


                  {!friendsLoading &&
                    friendProfiles.length ===
                      0 && (
                      <div
                        className="
                          py-6
                          text-center
                          text-xs
                          text-white/35
                        "
                      >
                        You can create the group now and invite people with its code.
                      </div>
                    )}


                  {filteredFriends.map(
                    (
                      profile,
                    ) => {
                      const selected =
                        selectedIds.includes(
                          profile.id,
                        );


                      const displayName =
                        profile.displayName ||
                        profile.username ||
                        "User";


                      return (
                        <button
                          key={
                            profile.id
                          }
                          type="button"
                          onClick={() =>
                            toggleFriend(
                              profile.id,
                            )
                          }
                          className="
                            flex
                            w-full
                            items-center
                            gap-3
                            rounded-xl
                            px-2
                            py-2
                            text-left
                            hover:bg-white/5
                          "
                        >
                          <Avatar
                            src={
                              profile.avatarURL ||
                              ""
                            }
                            fallback={
                              displayName
                            }
                            size={36}
                          />


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
                                text-white
                              "
                            >
                              {
                                displayName
                              }
                            </div>

                            <div
                              className="
                                truncate
                                text-xs
                                text-white/35
                              "
                            >
                              @
                              {
                                profile.username
                              }
                            </div>
                          </div>


                          <div
                            className={[
                              "grid h-5 w-5 place-items-center rounded-md border",

                              selected
                                ? "border-[var(--md-sys-color-primary)] bg-[var(--md-sys-color-primary-container)]"
                                : "border-white/15",
                            ].join(
                              " ",
                            )}
                          >
                            {selected && (
                              <Check
                                size={13}
                                className="text-white"
                              />
                            )}
                          </div>
                        </button>
                      );
                    },
                  )}
                </div>


                {error && (
                  <div
                    className="
                      mt-3
                      text-xs
                      text-[var(--md-sys-color-error)]
                    "
                  >
                    {error}
                  </div>
                )}


                <div
                  className="
                    mt-5
                    flex
                    justify-end
                    gap-2
                  "
                >
                  <button
                    type="button"
                    onClick={
                      onClose
                    }
                    className="
                      h-10
                      rounded-xl
                      px-4
                      text-sm
                      font-medium
                      text-white/45
                      hover:bg-white/5
                      hover:text-white
                    "
                  >
                    Cancel
                  </button>


                  <button
                    type="button"
                    disabled={
                      loading ||
                      !groupName.trim()
                    }
                    onClick={
                      handleCreate
                    }
                    className="
                      h-10
                      rounded-xl
                      bg-[var(--md-sys-color-primary-container)]
                      px-5
                      text-sm
                      font-semibold
                      text-[var(--md-sys-color-on-primary-container)]
                      disabled:opacity-35
                    "
                  >
                    {loading
                      ? "Creating..."
                      : "Create Group"}
                  </button>
                </div>
              </div>
            ) : (
              /* =============================================
                 JOIN CODE
                 ============================================= */

              <div
                className="
                  p-6
                "
              >
                <div
                  className="
                    mx-auto
                    grid
                    h-11
                    w-11
                    place-items-center
                    rounded-full
                    bg-white/5
                    text-white/55
                  "
                >
                  <Hash
                    size={20}
                  />
                </div>


                <div
                  className="
                    mt-4
                    text-center
                    text-sm
                    font-semibold
                    text-white
                  "
                >
                  Join a Group
                </div>


                <div
                  className="
                    mt-1
                    text-center
                    text-xs
                    text-white/35
                  "
                >
                  Enter the 7-character code shared by a group member.
                </div>


                <input
                  value={
                    joinCode
                  }
                  maxLength={7}
                  autoFocus
                  onChange={(
                    event,
                  ) =>
                    setJoinCode(
                      normalizeGroupCode(
                        event.target
                          .value,
                      ).slice(
                        0,
                        7,
                      ),
                    )
                  }
                  onKeyDown={(
                    event,
                  ) => {
                    if (
                      event.key ===
                      "Enter"
                    ) {
                      handleJoin();
                    }
                  }}
                  placeholder="K7M4Q2P"
                  className="
                    mt-6
                    h-12
                    w-full
                    rounded-xl
                    border
                    border-white/10
                    bg-black/15
                    px-4
                    text-center
                    font-mono
                    text-lg
                    font-bold
                    uppercase
                    tracking-[0.2em]
                    text-white
                    outline-none
                    placeholder:text-white/15
                    focus:border-[var(--md-sys-color-primary)]
                  "
                />


                {error && (
                  <div
                    className="
                      mt-3
                      text-center
                      text-xs
                      text-[var(--md-sys-color-error)]
                    "
                  >
                    {error}
                  </div>
                )}


                <button
                  type="button"
                  disabled={
                    loading ||
                    joinCode.length !==
                      7
                  }
                  onClick={
                    handleJoin
                  }
                  className="
                    mt-5
                    h-10
                    w-full
                    rounded-xl
                    bg-[var(--md-sys-color-primary-container)]
                    text-sm
                    font-semibold
                    text-[var(--md-sys-color-on-primary-container)]
                    disabled:opacity-35
                  "
                >
                  {loading
                    ? "Joining..."
                    : "Join Group"}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}