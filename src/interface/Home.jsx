import {
  FileText,
  MessageCircle,
  Settings,
  UserPlus,
  Users,
} from "lucide-react";

import {
  useNavigate,
} from "react-router-dom";


/* =========================================================
   HOME ACTION
   ========================================================= */

function HomeAction({
  icon: Icon,
  title,
  description,
  onClick,
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="
        group
        flex
        min-h-[108px]
        w-full
        items-start
        gap-4

        rounded-[var(--borderRadius-md)]

        bg-[var(--md-sys-color-surface-container-high)]

        p-4

        text-left

        transition-colors

        hover:bg-[var(--md-sys-color-surface-container-highest)]
      "
    >
      <div
        className="
          mt-0.5
          grid
          h-9
          w-9
          shrink-0
          place-items-center

          rounded-[var(--borderRadius-sm)]

          text-[var(--md-sys-color-primary)]
        "
      >
        <Icon
          size={22}
          strokeWidth={1.8}
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

            text-sm
            leading-5

            text-[var(--md-sys-color-outline)]
          "
        >
          {description}
        </div>
      </div>
    </button>
  );
}


/* =========================================================
   HOME PAGE
   ========================================================= */

export function HomePage() {
  const navigate =
    useNavigate();


  function startConversation() {
    window.alert(
      "New direct message UI goes here.",
    );
  }


  function createGroup() {
    window.alert(
      "Create group chat UI goes here.",
    );
  }


  return (
    <div
      className="
        flex
        min-h-0
        min-w-0
        flex-1
        flex-col

        bg-[var(--md-sys-color-surface-container-low)]
      "
    >

      {/* =====================================================
          HEADER
          ===================================================== */}

      <header
        className="
          flex
          h-[64px]
          shrink-0
          items-center
          gap-3

          border-b
          border-[var(--md-sys-color-outline-variant)]

          px-5
        "
      >
        <MessageCircle
          size={20}
          className="
            text-[var(--md-sys-color-on-surface)]
          "
        />

        <span
          className="
            text-base
            font-semibold

            text-[var(--md-sys-color-on-surface)]
          "
        >
          Home
        </span>
      </header>


      {/* =====================================================
          CENTER CONTENT
          ===================================================== */}

      <main
        className="
          flex
          min-h-0
          flex-1
          items-center
          justify-center

          overflow-y-auto

          px-6
          py-10
        "
      >
        <div
          className="
            w-full
            max-w-[620px]
          "
        >

          {/* TITLE */}

          <div
            className="
              mb-8
              text-center
            "
          >
            <h1
              className="
                text-4xl
                font-bold
                tracking-tight

                text-[var(--md-sys-color-on-surface)]
              "
            >
              Chatroom
            </h1>

            <p
              className="
                mt-2

                text-sm

                text-[var(--md-sys-color-outline)]
              "
            >
              Your conversations, friends, and groups in one place.
            </p>
          </div>


          {/* ACTIONS */}

          <div
            className="
              grid
              grid-cols-2
              gap-2

              max-sm:grid-cols-1
            "
          >
            <HomeAction
              icon={
                MessageCircle
              }
              title="Start a conversation"
              description="Send a direct message to a friend or start chatting with someone new."
              onClick={
                startConversation
              }
            />

            <HomeAction
              icon={Users}
              title="Create a group chat"
              description="Bring several people together in one conversation."
              onClick={
                createGroup
              }
            />

            <HomeAction
              icon={UserPlus}
              title="Find friends"
              description="View your friends, requests, and blocked users."
              onClick={() =>
                navigate(
                  "/friends",
                )
              }
            />

            <HomeAction
              icon={FileText}
              title="Saved Notes"
              description="Keep messages, links, and notes available for yourself."
              onClick={() =>
                navigate(
                  "/channel/saved-notes",
                )
              }
            />

            <div
              className="
                col-span-2

                max-sm:col-span-1
              "
            >
              <HomeAction
                icon={Settings}
                title="Open settings"
                description="Manage your account, profile, privacy, notifications, and app preferences."
                onClick={() =>
                  navigate(
                    "/settings",
                  )
                }
              />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}