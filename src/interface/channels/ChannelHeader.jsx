import {
  AtSign,
  Hash,
  Phone,
  Pin,
  Search,
  Settings,
  StickyNote,
  UserPlus,
  Users,
} from "lucide-react";

import {
  canIHasSidebar,
} from "./text/TextChannel";


function StatusDot({
  status,
}) {
  return (
    <span
      className={[
        "h-2 w-2 rounded-full",

        status === "Online"
          ? "bg-emerald-500"
          : status === "Idle"
            ? "bg-amber-400"
            : status === "Busy"
              ? "bg-red-500"
              : "bg-zinc-500",
      ].join(" ")}
    />
  );
}


function HeaderButton({
  children,
  title,
  onClick,
  active = false,
}) {
  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      className={[
        "grid h-9 w-9 shrink-0 place-items-center rounded-lg transition",

        active
          ? "bg-white/10 text-white"
          : "text-white/55 hover:bg-white/7 hover:text-white",
      ].join(" ")}
    >
      {children}
    </button>
  );
}


export function ChannelHeader({
  channel,

  sidebarState,

  setSidebarState,

  memberSidebarOpen,

  onToggleMembers,

  onOpenGroupSettings,

  onAddGroupMembers,
}) {
  const searchValue =
    sidebarState?.state ===
    "search"
      ? sidebarState.query
      : "";


  return (
    <div
      className="
        flex
        h-14
        min-w-0
        flex-1
        items-center
        gap-2
        px-4
      "
    >
      {/* ===================================================
          TEXT CHANNEL
          =================================================== */}

      {channel.type ===
        "TextChannel" && (
        <>
          <Hash
            size={21}
            className="shrink-0 text-white/45"
          />


          <button
            type="button"
            className="
              min-w-0
              truncate
              text-left
              font-semibold
              text-white
            "
          >
            {channel.name}
          </button>


          {channel.description && (
            <>
              <div
                className="
                  mx-1
                  hidden
                  h-5
                  w-px
                  bg-[var(--md-sys-color-outline-variant)]
                  md:block
                "
              />


              <div
                className="
                  hidden
                  min-w-0
                  max-w-[420px]
                  truncate
                  text-sm
                  text-white/40
                  md:block
                "
              >
                {
                  channel.description
                }
              </div>
            </>
          )}
        </>
      )}


      {/* ===================================================
          GROUP
          =================================================== */}

      {channel.type ===
        "Group" && (
        <>
          <Hash
            size={21}
            className="shrink-0 text-white/45"
          />


          <span
            className="
              min-w-0
              truncate
              font-semibold
              text-white
            "
          >
            {channel.name}
          </span>
        </>
      )}


      {/* ===================================================
          DM
          =================================================== */}

      {channel.type ===
        "DirectMessage" && (
        <>
          <AtSign
            size={21}
            className="shrink-0 text-white/45"
          />


          <span
            className="
              min-w-0
              truncate
              font-semibold
              text-white
            "
          >
            {
              channel.recipient
                ?.username
            }
          </span>


          <StatusDot
            status={
              channel.recipient
                ?.presence
            }
          />
        </>
      )}


      {/* ===================================================
          SAVED MESSAGES
          =================================================== */}

      {channel.type ===
        "SavedMessages" && (
        <>
          <StickyNote
            size={21}
            className="text-white/45"
          />


          <span
            className="
              font-semibold
              text-white
            "
          >
            Saved Notes
          </span>
        </>
      )}


      <div className="flex-1" />


      {/* ===================================================
          VOICE
          =================================================== */}

      {channel.isVoice && (
        <HeaderButton
          title="Join voice channel"
          onClick={() =>
            window.alert(
              "Voice connection goes here.",
            )
          }
        >
          <Phone
            size={19}
          />
        </HeaderButton>
      )}


      {/* ===================================================
          GROUP ADMIN — ADD PEOPLE

          ONLY CREATOR / ADMIN SEES THIS.
          =================================================== */}

      {channel.type ===
        "Group" &&
        channel.canManage && (
          <HeaderButton
            title="Add people"
            onClick={
              onAddGroupMembers
            }
          >
            <UserPlus
              size={19}
            />
          </HeaderButton>
        )}


      {/* ===================================================
          GROUP SETTINGS

          ALL GROUP MEMBERS CAN OPEN IT.
          Only admin gets editing controls.
          =================================================== */}

      {channel.type ===
        "Group" && (
        <HeaderButton
          title="Group settings"
          onClick={
            onOpenGroupSettings
          }
        >
          <Settings
            size={19}
          />
        </HeaderButton>
      )}


      {/* EXISTING SERVER SETTINGS */}

      {channel.type !==
        "Group" &&
        channel.serverId &&
        channel.canManage && (
          <HeaderButton
            title="Channel settings"
            onClick={() =>
              window.alert(
                "Channel settings modal goes here.",
              )
            }
          >
            <Settings
              size={19}
            />
          </HeaderButton>
        )}


      {/* ===================================================
          PINS
          =================================================== */}

      {sidebarState && (
        <HeaderButton
          title="View pinned messages"
          active={
            sidebarState.state ===
            "pins"
          }
          onClick={() =>
            sidebarState.state ===
            "pins"
              ? setSidebarState({
                  state:
                    "default",
                })
              : setSidebarState({
                  state:
                    "pins",
                })
          }
        >
          <Pin
            size={18}
          />
        </HeaderButton>
      )}


      {/* ===================================================
          MEMBERS
          =================================================== */}

      {sidebarState &&
        canIHasSidebar(
          channel,
        ) && (
          <HeaderButton
            title="View members"
            active={
              memberSidebarOpen
            }
            onClick={
              onToggleMembers
            }
          >
            <Users
              size={19}
            />
          </HeaderButton>
        )}


      {/* ===================================================
          SEARCH
          =================================================== */}

      {sidebarState && (
        <>
          <div className="hidden md:block">
            <div
              className="
                flex
                h-10
                w-[240px]
                items-center
                gap-2
                rounded-full
                bg-[var(--md-sys-color-surface-container-high)]
                px-4
              "
            >
              <Search
                size={16}
                className="shrink-0 text-white/40"
              />


              <input
                type="text"
                value={
                  searchValue
                }
                placeholder="Search messages..."
                onChange={(
                  event,
                ) => {
                  const value =
                    event.target
                      .value;


                  setSidebarState(
                    value
                      ? {
                          state:
                            "search",

                          query:
                            value,
                        }
                      : {
                          state:
                            "default",
                        },
                  );
                }}
                className="
                  min-w-0
                  flex-1
                  bg-transparent
                  text-sm
                  text-white
                  outline-none
                  placeholder:text-white/30
                "
              />
            </div>
          </div>


          <div className="md:hidden">
            <HeaderButton
              title="Search"
              onClick={() =>
                setSidebarState({
                  state:
                    "search",

                  query: "",
                })
              }
            >
              <Search
                size={18}
              />
            </HeaderButton>
          </div>
        </>
      )}
    </div>
  );
}