import {
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  User,
} from "lucide-react";

import {
  useState,
} from "react";

import {
  Link,
  Navigate,
  useNavigate,
} from "react-router-dom";

import {
  AuthLayout,
} from "./AuthLayout";

import {
  useAuth,
} from "./AuthContext";


function getErrorMessage(error) {
  switch (error?.code) {
    case "auth/email-already-in-use":
      return "An account already exists with this email.";

    case "auth/invalid-email":
      return "Enter a valid email address.";

    case "auth/weak-password":
      return "Your password is too weak.";

    case "auth/network-request-failed":
      return "Network error. Check your connection.";

    case "permission-denied":
      return "Chatroom could not create your profile.";

    default:
      console.error(error);

      return "Unable to create your account. Please try again.";
  }
}


export function SignUp() {
  const {
    user,
    loading: authLoading,
    signUp,
  } = useAuth();

  const navigate =
    useNavigate();

  const [
    username,
    setUsername,
  ] = useState("");

  const [
    email,
    setEmail,
  ] = useState("");

  const [
    password,
    setPassword,
  ] = useState("");

  const [
    showPassword,
    setShowPassword,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState("");

  const [
    submitting,
    setSubmitting,
  ] = useState(false);


  if (
    !authLoading &&
    user
  ) {
    return (
      <Navigate
        to="/"
        replace
      />
    );
  }


  async function handleSubmit(event) {
    event.preventDefault();

    const cleanUsername =
      username.trim();

    setError("");


    if (cleanUsername.length < 3) {
      setError(
        "Username must be at least 3 characters.",
      );

      return;
    }


    if (cleanUsername.length > 24) {
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


    if (password.length < 6) {
      setError(
        "Password must be at least 6 characters.",
      );

      return;
    }


    setSubmitting(true);

    try {
      await signUp({
        username:
          cleanUsername,

        email,

        password,
      });

      navigate(
        "/",
        {
          replace: true,
        },
      );
    } catch (err) {
      setError(
        getErrorMessage(err),
      );
    } finally {
      setSubmitting(false);
    }
  }


  return (
    <AuthLayout
      title="Create your account"
      subtitle="Join Chatroom and start a conversation."
    >
      <form
        onSubmit={handleSubmit}
        className="
          flex
          flex-col
          gap-4
        "
      >
        {/* USERNAME */}

        <label
          className="
            flex
            flex-col
            gap-1.5
          "
        >
          <span
            className="
              text-xs
              font-semibold
              text-[var(--md-sys-color-on-surface-variant)]
            "
          >
            Username
          </span>

          <div className="relative">
            <User
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
              required
              minLength={3}
              maxLength={24}
              autoComplete="username"
              value={username}
              onChange={(event) =>
                setUsername(
                  event.target.value,
                )
              }
              placeholder="Choose a username"
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
        </label>


        {/* EMAIL */}

        <label
          className="
            flex
            flex-col
            gap-1.5
          "
        >
          <span
            className="
              text-xs
              font-semibold
              text-[var(--md-sys-color-on-surface-variant)]
            "
          >
            Email
          </span>

          <div className="relative">
            <Mail
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
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(event) =>
                setEmail(
                  event.target.value,
                )
              }
              placeholder="you@example.com"
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
        </label>


        {/* PASSWORD */}

        <label
          className="
            flex
            flex-col
            gap-1.5
          "
        >
          <span
            className="
              text-xs
              font-semibold
              text-[var(--md-sys-color-on-surface-variant)]
            "
          >
            Password
          </span>

          <div className="relative">
            <LockKeyhole
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
              type={
                showPassword
                  ? "text"
                  : "password"
              }
              required
              minLength={6}
              autoComplete="new-password"
              value={password}
              onChange={(event) =>
                setPassword(
                  event.target.value,
                )
              }
              placeholder="Create a password"
              className="
                h-11
                w-full

                rounded-[var(--borderRadius-sm)]

                border
                border-[var(--md-sys-color-outline-variant)]

                bg-[var(--md-sys-color-surface-container-low)]

                pl-10
                pr-11

                text-sm
                text-[var(--md-sys-color-on-surface)]

                outline-none

                placeholder:text-[var(--md-sys-color-outline)]

                focus:border-[var(--md-sys-color-primary)]
              "
            />

            <button
              type="button"
              title={
                showPassword
                  ? "Hide password"
                  : "Show password"
              }
              onClick={() =>
                setShowPassword(
                  (current) =>
                    !current,
                )
              }
              className="
                absolute
                right-2
                top-1/2

                grid
                h-8
                w-8
                -translate-y-1/2
                place-items-center

                rounded-md

                text-[var(--md-sys-color-outline)]

                hover:bg-[var(--md-sys-color-surface-container-highest)]
                hover:text-[var(--md-sys-color-on-surface)]
              "
            >
              {showPassword ? (
                <EyeOff size={17} />
              ) : (
                <Eye size={17} />
              )}
            </button>
          </div>
        </label>


        {/* ERROR */}

        {error && (
          <div
            className="
              rounded-[var(--borderRadius-sm)]

              bg-[var(--md-sys-color-error-container)]

              px-3
              py-2

              text-xs

              text-[var(--md-sys-color-on-error-container)]
            "
          >
            {error}
          </div>
        )}


        {/* CREATE */}

        <button
          type="submit"
          disabled={submitting}
          className="
            mt-2
            h-11

            rounded-[var(--borderRadius-sm)]

            bg-[var(--md-sys-color-primary-container)]

            text-sm
            font-semibold

            text-[var(--md-sys-color-on-primary-container)]

            transition

            hover:brightness-110

            disabled:cursor-not-allowed
            disabled:opacity-50
          "
        >
          {submitting
            ? "Creating account..."
            : "Create Account"}
        </button>


        <div
          className="
            mt-2
            text-center
            text-sm
            text-[var(--md-sys-color-outline)]
          "
        >
          Already have an account?{" "}

          <Link
            to="/login"
            className="
              font-semibold
              text-[var(--md-sys-color-primary)]
              hover:underline
            "
          >
            Sign in
          </Link>
        </div>
      </form>
    </AuthLayout>
  );
}