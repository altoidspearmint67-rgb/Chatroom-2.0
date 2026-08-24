import {
  Copy,
  Crown,
  Check,
  UserPlus,
  Users,
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
  renameGroupChat,
} from "../../../firebase/conversations";


export function GroupSettingsModal({
  open,
  channel,
  onClose,
  onAddPeople,
}) {
  const {
    user,
  } = useAuth();


  const [
    name,
    setName,
  ] = useState(
    channel?.name ||
      "",
  );


  const [
    saving,
    setSaving,
  ] = useState(false);


  const [
    error,
    setError,
  ] = useState("");


  const [
    copied,
    setCopied,
  ] = useState(false);


  const isAdmin =
    Boolean(
      channel?.ownerId &&
      channel.ownerId ===
        user?.uid,
    );


  const owner =
    useMemo(
      () =>
        channel?.members?.find(
          (
            member,
          ) =>
            member.id ===
            channel.ownerId,
        ) ||
        null,
      [
        channel?.members,
        channel?.ownerId,
      ],
    );


  const memberCount =
    channel?.members
      ?.length ||
    0;


  useEffect(() => {
    setName(
      channel?.name ||
        "",
    );

    setError("");
  }, [
    channel?.name,
    open,
  ]);


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


  async function save() {
    if (
      !isAdmin ||
      saving
    ) {
      return;
    }


    const cleanName =
      name.trim();


    if (!cleanName) {
      setError(
        "Enter a group name.",
      );

      return;
    }


    setSaving(
      true,
    );

    setError("");


    try {
      await renameGroupChat({
        conversationId:
          channel.conversationId ||
          channel.id,

        userId:
          user.uid,

        name:
          cleanName,
      });
    } catch (saveError) {
      console.error(
        "Unable to rename group:",
        saveError,
      );


      setError(
        saveError?.message ||
        "Unable to save group settings.",
      );
    } finally {
      setSaving(
        false,
      );
    }
  }


  async function copyCode() {
    if (
      !channel?.joinCode
    ) {
      return;
    }


    try {
      await navigator.clipboard.writeText(
        channel.joinCode,
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
        z-[120]
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
          w-full
          max-w-[470px]
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
              Group Settings
            </div>


            <div
              className="
                mt-0.5
                text-[11px]
                text-white/35
              "
            >
              {isAdmin
                ? "You are the group admin."
                : "Group information"}
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


        <div
          className="p-5"
        >
          {/* GENERAL */}

          <div
            className="
              text-[11px]
              font-semibold
              uppercase
              tracking-wide
              text-white/35
            "
          >
            General
          </div>


          <label
            className="
              mt-4
              block
              text-xs
              font-semibold
              text-white/55
            "
          >
            Group name
          </label>


          {isAdmin ? (
            <input
              value={
                name
              }
              maxLength={50}
              onChange={(
                event,
              ) =>
                setName(
                  event.target
                    .value,
                )
              }
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
                focus:border-[var(--md-sys-color-primary)]
              "
            />
          ) : (
            <div
              className="
                mt-2
                rounded-xl
                bg-white/4
                px-3
                py-3
                text-sm
                text-white/75
              "
            >
              {
                channel.name
              }
            </div>
          )}


          {/* JOIN CODE */}

          <label
            className="
              mt-5
              block
              text-xs
              font-semibold
              text-white/55
            "
          >
            Join code
          </label>


          <button
            type="button"
            onClick={
              copyCode
            }
            className="
              mt-2
              flex
              h-11
              w-full
              items-center
              rounded-xl
              bg-white/4
              px-3
              text-left
              hover:bg-white/7
            "
          >
            <span
              className="
                flex-1
                font-mono
                text-sm
                font-bold
                tracking-[0.18em]
                text-white
              "
            >
              {channel.joinCode ||
                "Unavailable"}
            </span>


            {copied ? (
              <Check
                size={17}
                className="text-emerald-400"
              />
            ) : (
              <Copy
                size={17}
                className="text-white/40"
              />
            )}
          </button>


          {/* ADMIN */}

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
            Admin
          </div>


          <div
            className="
              mt-3
              flex
              items-center
              gap-3
              rounded-xl
              bg-white/4
              px-3
              py-3
            "
          >
            <div
              className="
                grid
                h-9
                w-9
                place-items-center
                rounded-full
                bg-[var(--md-sys-color-primary-container)]
                text-[var(--md-sys-color-on-primary-container)]
              "
            >
              <Crown
                size={17}
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
                  truncate
                  text-sm
                  font-medium
                  text-white
                "
              >
                {owner?.displayName ||
                  owner?.username ||
                  "Group Creator"}
              </div>


              <div
                className="
                  mt-0.5
                  text-[11px]
                  text-white/35
                "
              >
                Creator · Group Admin
              </div>
            </div>
          </div>


          {/* MEMBERS */}

          <div
            className="
              mt-5
              flex
              items-center
              rounded-xl
              bg-white/4
              px-3
              py-3
            "
          >
            <Users
              size={18}
              className="text-white/40"
            />


            <span
              className="
                ml-3
                flex-1
                text-sm
                text-white/70
              "
            >
              {memberCount}{" "}
              {memberCount ===
              1
                ? "member"
                : "members"}
            </span>


            {isAdmin && (
              <button
                type="button"
                onClick={() => {
                  onClose?.();

                  onAddPeople?.();
                }}
                className="
                  flex
                  h-8
                  items-center
                  gap-1.5
                  rounded-lg
                  px-3
                  text-xs
                  font-semibold
                  text-[var(--md-sys-color-primary)]
                  hover:bg-white/7
                "
              >
                <UserPlus
                  size={14}
                />

                Add People
              </button>
            )}
          </div>


          {error && (
            <div
              className="
                mt-4
                text-xs
                text-[var(--md-sys-color-error)]
              "
            >
              {error}
            </div>
          )}


          {/* ACTIONS */}

          {isAdmin && (
            <div
              className="
                mt-6
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
                  saving ||
                  !name.trim() ||
                  name.trim() ===
                    channel.name
                }
                onClick={
                  save
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
                {saving
                  ? "Saving..."
                  : "Save Changes"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}