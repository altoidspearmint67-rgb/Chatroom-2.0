import {
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
} from "lucide-react";

import {
  useState,
} from "react";

import {
  Link,
  Navigate,
  useLocation,
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
    case "auth/invalid-credential":
      return "Incorrect email or password.";

    case "auth/invalid-email":
      return "Enter a valid email address.";

    case "auth/user-disabled":
      return "This account has been disabled.";

    case "auth/too-many-requests":
      return "Too many attempts. Try again later.";

    case "auth/network-request-failed":
      return "Network error. Check your connection.";

    default:
      console.error(error);

      return "Unable to sign in. Please try again.";
  }
}


export function Login() {
  const {
    user,
    loading: authLoading,
    signIn,
  } = useAuth();

  const navigate =
    useNavigate();

  const location =
    useLocation();

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

    setError("");
    setSubmitting(true);

    try {
      await signIn({
        email,
        password,
      });

      const destination =
        location.state?.from ||
        "/";

      navigate(
        destination,
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
      title="Welcome back"
      subtitle="Sign in to continue to Chatroom."
    >
      <form
        onSubmit={handleSubmit}
        className="
          flex
          flex-col
          gap-4
        "
      >
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
          <div
            className="
              flex
              items-center
              justify-between
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

            <Link
              to="/forgot-password"
              className="
                text-xs
                font-medium
                text-[var(--md-sys-color-primary)]
                hover:underline
              "
            >
              Forgot password?
            </Link>
          </div>

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
              autoComplete="current-password"
              value={password}
              onChange={(event) =>
                setPassword(
                  event.target.value,
                )
              }
              placeholder="Enter your password"
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


        <button
          type="submit"
          disabled={submitting}
          className="
            mt-2
            h-11
            w-full

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
            ? "Signing in..."
            : "Sign In"}
        </button>


        <div
          className="
            mt-2
            text-center
            text-sm
            text-[var(--md-sys-color-outline)]
          "
        >
          Don't have an account?{" "}

          <Link
            to="/signup"
            className="
              font-semibold
              text-[var(--md-sys-color-primary)]
              hover:underline
            "
          >
            Sign up
          </Link>
        </div>
      </form>
    </AuthLayout>
  );
}