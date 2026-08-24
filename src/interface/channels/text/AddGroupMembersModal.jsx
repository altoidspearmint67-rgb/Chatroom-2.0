import {
  Check,
  Search,
  UserPlus,
  X,
} from "lucide-react";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  useAuth,
} from "../../../auth/AuthContext";

import {
  getFriendships,
  getOtherUserId,
  getUserProfiles,
  subscribeToRelationships,
} from "../../../firebase/friends";

import {
  addGroupMembers,
} from "../../../firebase/conversations";

import {
  Avatar,
} from "../../ui";


export function AddGroupMembersModal({
  open,
  channel,
  onClose,
}) {
  const {
    user,
  } = useAuth();


  const [
    relationships,
    setRelationships,
  ] = useState([]);


  const [
    profiles,
    setProfiles,
  ] = useState([]);


  const [
    loadingFriends,
    setLoadingFriends,
  ] = useState(false);


  const [
    selectedIds,
    setSelectedIds,
  ] = useState([]);


  const [
    search,
    setSearch,
  ] = useState("");


  const [
    adding,
    setAdding,
  ] = useState(false);


  const [
    error,
    setError,
  ] = useState("");


  const isAdmin =
    channel?.ownerId ===
    user?.uid;


  const existingMemberIds =
    useMemo(
      () =>
        new Set(
          (
            channel?.members ||
            []
          ).map(
            (
              member,
            ) =>
              member.id,
          ),
        ),
      [
        channel?.members,
      ],
    );


  /* =========================================================
     RESET
     ========================================================= */

  useEffect(() => {
    if (!open) {
      setSelectedIds([]);
      setSearch("");
      setError("");
    }
  }, [
    open,
  ]);


  /* =========================================================
     RELATIONSHIPS
     ========================================================= */

  useEffect(() => {
    if (
      !open ||
      !user?.uid ||
      !isAdmin
    ) {
      setRelationships([]);

      return;
    }


    return subscribeToRelationships(
      user.uid,

      (
        items,
      ) =>
        setRelationships(
          items,
        ),

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
    isAdmin,
  ]);


  const friendIds =
    useMemo(
      () =>
        getFriendships(
          relationships,
        )
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
            (
              friendId,
            ) =>
              Boolean(
                friendId,
              ) &&
              !existingMemberIds.has(
                friendId,
              ),
          ),
      [
        relationships,
        user?.uid,
        existingMemberIds,
      ],
    );


  /* =========================================================
     LOAD FRIEND PROFILES
     ========================================================= */

  useEffect(() => {
    if (
      !open ||
      friendIds.length ===
        0
    ) {
      setProfiles([]);
      setLoadingFriends(false);

      return;
    }


    let cancelled =
      false;


    setLoadingFriends(
      true,
    );


    async function loadProfiles() {
      try {
        const loaded =
          await getUserProfiles(
            friendIds,
          );


        if (!cancelled) {
          setProfiles(
            loaded,
          );
        }
      } catch (loadError) {
        console.error(
          "Unable to load friend profiles:",
          loadError,
        );


        if (!cancelled) {
          setError(
            "Unable to load friends.",
          );
        }
      } finally {
        if (!cancelled) {
          setLoadingFriends(
            false,
          );
        }
      }
    }


    loadProfiles();


    return () => {
      cancelled =
        true;
    };
  }, [
    open,
    friendIds.join("|"),
  ]);


  const filteredProfiles =
    useMemo(
      () => {
        const needle =
          search
            .trim()
            .toLowerCase();


        if (!needle) {
          return profiles;
        }


        return profiles.filter(
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
        profiles,
        search,
      ],
    );


  const remainingSlots =
    Math.max(
      0,
      25 -
        (
          channel?.members
            ?.length ||
          0
        ),
    );


  function toggle(
    profileId,
  ) {
    setSelectedIds(
      (
        current,
      ) => {
        if (
          current.includes(
            profileId,
          )
        ) {
          return current.filter(
            (
              id,
            ) =>
              id !==
              profileId,
          );
        }


        if (
          current.length >=
          remainingSlots
        ) {
          return current;
        }


        return [
          ...current,
          profileId,
        ];
      },
    );
  }


  async function addPeople() {
    if (
      !isAdmin ||
      selectedIds.length ===
        0 ||
      adding
    ) {
      return;
    }


    setAdding(
      true,
    );

    setError("");


    try {
      await addGroupMembers({
        conversationId:
          channel.conversationId ||
          channel.id,

        userId:
          user.uid,

        memberIds:
          selectedIds,
      });


      onClose?.();
    } catch (addError) {
      console.error(
        "Unable to add group members:",
        addError,
      );


      setError(
        addError?.message ||
        "Unable to add people.",
      );
    } finally {
      setAdding(
        false,
      );
    }
  }


  if (
    !open ||
    !isAdmin
  ) {
    return null;
  }


  return (
    <div
      className="
        fixed
        inset-0
        z-[130]
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
          max-h-[75vh]
          w-full
          max-w-[460px]
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
                text-white
              "
            >
              Add People
            </div>


            <div
              className="
                mt-0.5
                text-[11px]
                text-white/35
              "
            >
              {remainingSlots} group slots remaining
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
              text-white/40
              hover:bg-white/7
              hover:text-white
            "
          >
            <X
              size={18}
            />
          </button>
        </div>


        {/* SEARCH */}

        {profiles.length >
          0 && (
          <div
            className="
              shrink-0
              p-4
              pb-2
            "
          >
            <div
              className="relative"
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
                  focus:border-[var(--md-sys-color-primary)]
                "
              />
            </div>
          </div>
        )}


        {/* FRIENDS */}

        <div
          className="
            min-h-0
            flex-1
            overflow-y-auto
            px-4
            py-2
          "
        >
          {loadingFriends && (
            <div
              className="
                py-8
                text-center
                text-xs
                text-white/35
              "
            >
              Loading friends...
            </div>
          )}


          {!loadingFriends &&
            profiles.length ===
              0 && (
              <div
                className="
                  py-10
                  text-center
                "
              >
                <UserPlus
                  size={23}
                  className="
                    mx-auto
                    text-white/25
                  "
                />


                <div
                  className="
                    mt-3
                    text-sm
                    font-medium
                    text-white/65
                  "
                >
                  No friends to add
                </div>


                <div
                  className="
                    mt-1
                    text-xs
                    text-white/30
                  "
                >
                  Everyone on your friends list is already in this group.
                </div>
              </div>
            )}


          {filteredProfiles.map(
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
                    toggle(
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
                      {displayName}
                    </div>


                    <div
                      className="
                        truncate
                        text-[11px]
                        text-white/35
                      "
                    >
                      @{profile.username}
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


        {/* FOOTER */}

        <div
          className="
            shrink-0
            border-t
            border-white/5
            p-4
          "
        >
          {error && (
            <div
              className="
                mb-3
                text-xs
                text-[var(--md-sys-color-error)]
              "
            >
              {error}
            </div>
          )}


          <div
            className="
              flex
              items-center
              justify-between
              gap-3
            "
          >
            <div
              className="
                text-xs
                text-white/35
              "
            >
              {selectedIds.length} selected
            </div>


            <div
              className="
                flex
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
                  adding ||
                  selectedIds.length ===
                    0
                }
                onClick={
                  addPeople
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
                {adding
                  ? "Adding..."
                  : selectedIds.length >
                      0
                    ? `Add ${selectedIds.length}`
                    : "Add People"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}