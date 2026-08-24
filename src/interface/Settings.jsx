import {
  Camera,
  LogOut,
  Save,
  UserRound,
} from "lucide-react";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  updateProfile,
} from "firebase/auth";

import {
  doc,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";

import {
  useNavigate,
} from "react-router-dom";

import {
  useAuth,
} from "../auth/AuthContext";

import {
  useCurrentProfile,
} from "../auth/useCurrentProfile";

import {
  auth,
  db,
} from "../firebase/firebase";

import {
  Avatar,
  UserStatus,
} from "./ui";


/* =========================================================
   CLOUDINARY
   ========================================================= */

const CLOUDINARY_CLOUD_NAME =
  import.meta.env
    .VITE_CLOUDINARY_CLOUD_NAME;

const CLOUDINARY_UPLOAD_PRESET =
  import.meta.env
    .VITE_CLOUDINARY_UPLOAD_PRESET;


/* =========================================================
   ROLE DISPLAY

   ONLY:
   role === "Owner" -> GOD rank image

   EVERY OTHER DATABASE ROLE -> CSS MEMBER rank
   ========================================================= */

const OWNER_ROLE_IMAGE =
  "/assets/ranks/God-Rank.png";


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


function RoleDisplay({
  role,
}) {
  const isOwner =
    normalizeRole(
      role,
    ) === "owner";


  if (isOwner) {
    return (
      <div
        className="
          flex
          min-h-[70px]
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
            max-w-[190px]
            select-none
            object-contain
          "
        />
      </div>
    );
  }


  return (
    <div
      className="
        flex
        min-h-[70px]
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
   DATE HELPERS
   ========================================================= */

function valueToDate(
  value,
) {
  if (!value) {
    return null;
  }


  if (
    typeof value.toDate ===
    "function"
  ) {
    return value.toDate();
  }


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
        "long",

      day:
        "numeric",

      year:
        "numeric",
    },
  );
}


function getMonthsOfService(
  value,
) {
  const joined =
    valueToDate(
      value,
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


/* =========================================================
   SETTINGS BLOCK
   ========================================================= */

function SettingBlock({
  title,
  description,
  children,
}) {
  return (
    <section
      className="
        rounded-[var(--borderRadius-lg)]

        border
        border-[var(--md-sys-color-outline-variant)]

        bg-[var(--md-sys-color-surface-container)]

        p-5
      "
    >
      <div className="mb-4">
        <h2
          className="
            text-sm
            font-semibold

            text-[var(--md-sys-color-on-surface)]
          "
        >
          {title}
        </h2>


        {description && (
          <p
            className="
              mt-1

              text-xs
              leading-5

              text-[var(--md-sys-color-outline)]
            "
          >
            {description}
          </p>
        )}
      </div>


      {children}
    </section>
  );
}


/* =========================================================
   SETTINGS
   ========================================================= */

export function Settings() {
  const navigate =
    useNavigate();


  const {
    user,
    logout,
  } = useAuth();


  const {
    profile,
    loading,
  } = useCurrentProfile();


  const fileInputRef =
    useRef(
      null,
    );


  const [
    username,
    setUsername,
  ] = useState("");


  const [
    savingUsername,
    setSavingUsername,
  ] = useState(false);


  const [
    uploadingAvatar,
    setUploadingAvatar,
  ] = useState(false);


  const [
    message,
    setMessage,
  ] = useState("");


  const [
    error,
    setError,
  ] = useState("");


  /* =========================================================
     SYNC USERNAME
     ========================================================= */

  useEffect(() => {
    if (!profile) {
      return;
    }


    setUsername(
      profile.username ||
      profile.displayName ||
      "",
    );
  }, [
    profile,
  ]);


  /* =========================================================
     PROFILE VALUES
     ========================================================= */

  const displayName =
    profile?.displayName ||
    profile?.username ||
    user?.displayName ||
    "Chatroom User";


  const avatarURL =
    profile?.avatarURL ||
    user?.photoURL ||
    "";


  const role =
    profile?.role ||
    "Member";


  const title =
    profile?.title ||
    "Member";


  /*
   * Prefer memberSince if you ever store it.
   * Otherwise use createdAt.
   */

  const createdAt =
    profile?.memberSince ||
    profile?.createdAt ||
    null;


  const months =
    useMemo(
      () => {
        const stored =
          profile?.monthsOfService;


        if (
          stored !==
            undefined &&
          stored !==
            null &&
          Number.isFinite(
            Number(
              stored,
            ),
          )
        ) {
          return Math.max(
            0,
            Number(
              stored,
            ),
          );
        }


        return getMonthsOfService(
          createdAt,
        );
      },
      [
        profile?.monthsOfService,
        createdAt,
      ],
    );


  /* =========================================================
     SAVE USERNAME
     ========================================================= */

  async function saveUsername() {
    const cleanUsername =
      username.trim();


    const usernameLower =
      cleanUsername.toLowerCase();


    setError("");
    setMessage("");


    if (
      cleanUsername.length <
      3
    ) {
      setError(
        "Username must be at least 3 characters.",
      );

      return;
    }


    if (
      cleanUsername.length >
      24
    ) {
      setError(
        "Username cannot be longer than 24 characters.",
      );

      return;
    }


    if (
      !/^[a-zA-Z0-9_.]+$/.test(
        cleanUsername,
      )
    ) {
      setError(
        "Username can only contain letters, numbers, underscores, and periods.",
      );

      return;
    }


    if (!user) {
      return;
    }


    setSavingUsername(
      true,
    );


    try {
      if (
        auth.currentUser
      ) {
        await updateProfile(
          auth.currentUser,
          {
            displayName:
              cleanUsername,
          },
        );
      }


      await updateDoc(
        doc(
          db,
          "users",
          user.uid,
        ),
        {
          username:
            cleanUsername,

          usernameLower,

          displayName:
            cleanUsername,

          updatedAt:
            serverTimestamp(),
        },
      );


      setMessage(
        "Username updated.",
      );
    } catch (err) {
      console.error(
        "Username update failed:",
        err,
      );


      setError(
        "Unable to update username.",
      );
    } finally {
      setSavingUsername(
        false,
      );
    }
  }


  /* =========================================================
     CLOUDINARY AVATAR
     ========================================================= */

  async function handleAvatarFile(
    event,
  ) {
    const file =
      event.target.files?.[0];


    event.target.value =
      "";


    if (
      !file ||
      !user
    ) {
      return;
    }


    setError("");
    setMessage("");


    if (
      !CLOUDINARY_CLOUD_NAME ||
      !CLOUDINARY_UPLOAD_PRESET
    ) {
      setError(
        "Cloudinary is not configured. Check your .env.local file.",
      );

      return;
    }


    const allowedTypes = [
      "image/png",
      "image/jpeg",
      "image/gif",
      "image/webp",
    ];


    if (
      !allowedTypes.includes(
        file.type,
      )
    ) {
      setError(
        "Choose a PNG, JPG, GIF, or WebP image.",
      );

      return;
    }


    if (
      file.size >
      5 *
        1024 *
        1024
    ) {
      setError(
        "Profile pictures must be 5 MB or smaller.",
      );

      return;
    }


    setUploadingAvatar(
      true,
    );


    try {
      const formData =
        new FormData();


      formData.append(
        "file",
        file,
      );


      formData.append(
        "upload_preset",
        CLOUDINARY_UPLOAD_PRESET,
      );


      const response =
        await fetch(
          `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
          {
            method:
              "POST",

            body:
              formData,
          },
        );


      const result =
        await response.json();


      if (!response.ok) {
        console.error(
          "Cloudinary error:",
          result,
        );


        throw new Error(
          result?.error
            ?.message ||
          "Cloudinary upload failed.",
        );
      }


      const downloadURL =
        result?.secure_url;


      if (!downloadURL) {
        throw new Error(
          "Cloudinary did not return an image URL.",
        );
      }


      if (
        auth.currentUser
      ) {
        await updateProfile(
          auth.currentUser,
          {
            photoURL:
              downloadURL,
          },
        );
      }


      await updateDoc(
        doc(
          db,
          "users",
          user.uid,
        ),
        {
          avatarURL:
            downloadURL,

          needsAvatarSetup:
            false,

          updatedAt:
            serverTimestamp(),
        },
      );


      setMessage(
        "Profile picture updated.",
      );
    } catch (err) {
      console.error(
        "Profile picture upload failed:",
        err,
      );


      setError(
        err?.message ||
        "Unable to update profile picture.",
      );
    } finally {
      setUploadingAvatar(
        false,
      );
    }
  }


  /* =========================================================
     LOG OUT
     ========================================================= */

  async function handleLogout() {
    try {
      await logout();


      navigate(
        "/login",
        {
          replace:
            true,
        },
      );
    } catch (err) {
      console.error(
        "Logout failed:",
        err,
      );


      setError(
        "Unable to log out.",
      );
    }
  }


  /* =========================================================
     LOADING
     ========================================================= */

  if (loading) {
    return (
      <div
        className="
          flex
          min-h-0
          min-w-0
          flex-1
          items-center
          justify-center

          bg-[var(--md-sys-color-surface-container-low)]

          text-sm

          text-[var(--md-sys-color-outline)]
        "
      >
        Loading settings...
      </div>
    );
  }


  return (
    <div
      className="
        min-h-0
        min-w-0
        flex-1

        overflow-y-auto

        bg-[var(--md-sys-color-surface-container-low)]
      "
    >
      <div
        className="
          mx-auto

          w-full
          max-w-[780px]

          px-6
          py-8

          max-sm:px-4
          max-sm:py-5
        "
      >
        {/* HEADER */}

        <div className="mb-6">
          <h1
            className="
              text-2xl
              font-semibold

              text-[var(--md-sys-color-on-surface)]
            "
          >
            Settings
          </h1>


          <p
            className="
              mt-1

              text-sm

              text-[var(--md-sys-color-outline)]
            "
          >
            Manage your Chatroom account and profile.
          </p>
        </div>


        {/* =================================================
            PROFILE SUMMARY
            ================================================= */}

        <section
          className="
            mb-4

            overflow-hidden

            rounded-[var(--borderRadius-lg)]

            border
            border-[var(--md-sys-color-outline-variant)]

            bg-[var(--md-sys-color-surface-container-high)]
          "
        >
          <div
            className="
              flex
              items-center
              gap-5

              p-5

              max-sm:flex-col
              max-sm:text-center
            "
          >
            <button
              type="button"
              title="Change profile picture"
              disabled={
                uploadingAvatar
              }
              onClick={() =>
                fileInputRef
                  .current
                  ?.click()
              }
              className="
                group
                relative
                shrink-0

                rounded-[var(--borderRadius-md)]

                disabled:cursor-not-allowed
                disabled:opacity-60
              "
            >
              <Avatar
                src={
                  avatarURL
                }
                fallback={
                  displayName
                }
                size={88}
              />


              <div
                className="
                  absolute
                  inset-0

                  grid
                  place-items-center

                  rounded-[var(--borderRadius-md)]

                  bg-black/0
                  text-white/0

                  transition

                  group-hover:bg-black/55
                  group-hover:text-white
                "
              >
                <Camera
                  size={22}
                />
              </div>
            </button>


            <input
              ref={
                fileInputRef
              }
              type="file"
              accept="image/png,image/jpeg,image/gif,image/webp"
              className="hidden"
              onChange={
                handleAvatarFile
              }
            />


            <div
              className="
                min-w-0
                flex-1
              "
            >
              <div
                className="
                  flex
                  items-center
                  gap-2

                  max-sm:justify-center
                "
              >
                <h2
                  className="
                    truncate

                    text-xl
                    font-semibold

                    text-[var(--md-sys-color-on-surface)]
                  "
                >
                  {displayName}
                </h2>


                <UserStatus
                  status={
                    profile?.status ||
                    "Online"
                  }
                  size="10px"
                />
              </div>


              <div
                className="
                  mt-1

                  text-sm

                  text-[var(--md-sys-color-outline)]
                "
              >
                {title}
              </div>
            </div>


            {/* =============================================
                RANK

                OWNER = GOD
                EVERYONE ELSE = MEMBER
                ============================================= */}

            <div
              className="
                flex
                w-[190px]
                shrink-0
                items-center
                justify-center

                max-sm:w-full
              "
            >
              <RoleDisplay
                role={
                  role
                }
              />
            </div>
          </div>


          <div
            className="
              grid
              grid-cols-2

              border-t
              border-[var(--md-sys-color-outline-variant)]

              bg-[var(--md-sys-color-surface-container-low)]

              max-sm:grid-cols-1
            "
          >
            <div
              className="
                p-4

                max-sm:border-b
                max-sm:border-[var(--md-sys-color-outline-variant)]
              "
            >
              <div
                className="
                  text-[11px]
                  font-semibold
                  uppercase
                  tracking-wide

                  text-[var(--md-sys-color-outline)]
                "
              >
                Member Since
              </div>


              <div
                className="
                  mt-1

                  text-sm
                  font-medium

                  text-[var(--md-sys-color-on-surface)]
                "
              >
                {formatMemberSince(
                  createdAt,
                )}
              </div>
            </div>


            <div className="p-4">
              <div
                className="
                  text-[11px]
                  font-semibold
                  uppercase
                  tracking-wide

                  text-[var(--md-sys-color-outline)]
                "
              >
                Service
              </div>


              <div
                className="
                  mt-1

                  text-sm
                  font-semibold

                  text-[var(--md-sys-color-primary)]
                "
              >
                {months}{" "}
                {months ===
                1
                  ? "Month"
                  : "Months"}{" "}
                of Service
              </div>
            </div>
          </div>
        </section>


        {/* SUCCESS */}

        {message && (
          <div
            className="
              mb-4

              rounded-[var(--borderRadius-sm)]

              bg-[var(--md-sys-color-primary-container)]

              px-4
              py-3

              text-sm

              text-[var(--md-sys-color-on-primary-container)]
            "
          >
            {message}
          </div>
        )}


        {/* ERROR */}

        {error && (
          <div
            className="
              mb-4

              rounded-[var(--borderRadius-sm)]

              bg-[var(--md-sys-color-error-container)]

              px-4
              py-3

              text-sm

              text-[var(--md-sys-color-on-error-container)]
            "
          >
            {error}
          </div>
        )}


        <div
          className="
            flex
            flex-col
            gap-4
          "
        >
          {/* PROFILE PICTURE */}

          <SettingBlock
            title="Profile Picture"
            description="Choose the image other Chatroom users will see."
          >
            <div
              className="
                flex
                items-center
                gap-4

                max-sm:flex-col
                max-sm:items-start
              "
            >
              <Avatar
                src={
                  avatarURL
                }
                fallback={
                  displayName
                }
                size={56}
              />


              <div>
                <button
                  type="button"
                  disabled={
                    uploadingAvatar
                  }
                  onClick={() =>
                    fileInputRef
                      .current
                      ?.click()
                  }
                  className="
                    inline-flex
                    h-10
                    items-center
                    gap-2

                    rounded-[var(--borderRadius-sm)]

                    bg-[var(--md-sys-color-primary-container)]

                    px-4

                    text-xs
                    font-semibold

                    text-[var(--md-sys-color-on-primary-container)]

                    transition

                    hover:brightness-110

                    disabled:cursor-not-allowed
                    disabled:opacity-50
                  "
                >
                  <Camera
                    size={16}
                  />


                  {uploadingAvatar
                    ? "Uploading..."
                    : avatarURL
                      ? "Change Picture"
                      : "Choose Picture"}
                </button>


                <div
                  className="
                    mt-2

                    text-[11px]

                    text-[var(--md-sys-color-outline)]
                  "
                >
                  PNG, JPG, GIF or WebP. Maximum 5 MB.
                </div>
              </div>
            </div>
          </SettingBlock>


          {/* USERNAME */}

          <SettingBlock
            title="Username"
            description="This is the name other people see in Chatroom."
          >
            <div
              className="
                flex
                items-center
                gap-2

                max-sm:flex-col
                max-sm:items-stretch
              "
            >
              <div
                className="
                  relative
                  min-w-0
                  flex-1
                "
              >
                <UserRound
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
                    username
                  }
                  minLength={3}
                  maxLength={24}
                  onChange={(
                    event,
                  ) =>
                    setUsername(
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

                    bg-[var(--md-sys-color-surface-container-low)]

                    pl-10
                    pr-3

                    text-sm

                    text-[var(--md-sys-color-on-surface)]

                    outline-none

                    focus:border-[var(--md-sys-color-primary)]
                  "
                />
              </div>


              <button
                type="button"
                disabled={
                  savingUsername
                }
                onClick={
                  saveUsername
                }
                className="
                  inline-flex
                  h-10
                  shrink-0
                  items-center
                  justify-center
                  gap-2

                  rounded-[var(--borderRadius-sm)]

                  bg-[var(--md-sys-color-primary-container)]

                  px-4

                  text-xs
                  font-semibold

                  text-[var(--md-sys-color-on-primary-container)]

                  transition

                  hover:brightness-110

                  disabled:cursor-not-allowed
                  disabled:opacity-50
                "
              >
                <Save
                  size={15}
                />


                {savingUsername
                  ? "Saving..."
                  : "Save"}
              </button>
            </div>
          </SettingBlock>


          {/* EMAIL */}

          <SettingBlock
            title="Email"
            description="Your account email."
          >
            <div
              className="
                rounded-[var(--borderRadius-sm)]

                border
                border-[var(--md-sys-color-outline-variant)]

                bg-[var(--md-sys-color-surface-container-low)]

                px-3
                py-2.5

                text-sm

                text-[var(--md-sys-color-on-surface-variant)]
              "
            >
              {user?.email ||
                "No email"}
            </div>
          </SettingBlock>


          {/* ACCOUNT */}

          <SettingBlock
            title="Account"
            description="Information associated with your Chatroom account."
          >
            <div
              className="
                grid
                grid-cols-3
                gap-4

                max-sm:grid-cols-1
              "
            >
              <div>
                <div
                  className="
                    text-[11px]
                    uppercase
                    tracking-wide

                    text-[var(--md-sys-color-outline)]
                  "
                >
                  Role
                </div>


                <div
                  className="
                    mt-1
                    text-sm

                    text-[var(--md-sys-color-on-surface)]
                  "
                >
                  {role}
                </div>
              </div>


              <div>
                <div
                  className="
                    text-[11px]
                    uppercase
                    tracking-wide

                    text-[var(--md-sys-color-outline)]
                  "
                >
                  Messages
                </div>


                <div
                  className="
                    mt-1
                    text-sm

                    text-[var(--md-sys-color-on-surface)]
                  "
                >
                  {Number(
                    profile
                      ?.messageCount ??
                    0,
                  ).toLocaleString()}
                </div>
              </div>


              <div>
                <div
                  className="
                    text-[11px]
                    uppercase
                    tracking-wide

                    text-[var(--md-sys-color-outline)]
                  "
                >
                  Member Since
                </div>


                <div
                  className="
                    mt-1
                    text-sm

                    text-[var(--md-sys-color-on-surface)]
                  "
                >
                  {formatMemberSince(
                    createdAt,
                  )}
                </div>
              </div>
            </div>
          </SettingBlock>


          {/* SIGN OUT */}

          <SettingBlock
            title="Sign Out"
            description="Sign out of Chatroom on this device."
          >
            <button
              type="button"
              onClick={
                handleLogout
              }
              className="
                inline-flex
                h-10
                items-center
                gap-2

                rounded-[var(--borderRadius-sm)]

                bg-[var(--md-sys-color-error-container)]

                px-4

                text-xs
                font-semibold

                text-[var(--md-sys-color-on-error-container)]

                transition

                hover:brightness-110
              "
            >
              <LogOut
                size={16}
              />

              Log Out
            </button>
          </SettingBlock>
        </div>
      </div>
    </div>
  );
}