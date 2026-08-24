import {
  ArrowLeft,
  Mail,
} from "lucide-react";

import {
  useState,
} from "react";

import {
  Link,
} from "react-router-dom";

import {
  AuthLayout,
} from "./AuthLayout";

import {
  useAuth,
} from "./AuthContext";


export function ForgotPassword() {
  const {
    resetPassword,
  } = useAuth();

  const [
    email,
    setEmail,
  ] = useState("");

  const [
    error,
    setError,
  ] = useState("");

  const [
    sent,
    setSent,
  ] = useState(false);

  const [
    submitting,
    setSubmitting,
  ] = useState(false);


  async function handleSubmit(event) {
    event.preventDefault();

    setError("");
    setSent(false);
    setSubmitting(true);

    try {
      await resetPassword(
        email,
      );

      setSent(true);
    } catch (err) {
      console.error(err);

      if (
        err?.code ===
        "auth/invalid-email"
      ) {
        setError(
          "Enter a valid email address.",
        );
      } else if (
        err?.code ===
        "auth/network-request-failed"
      ) {
        setError(
          "Network error. Check your connection.",
        );
      } else {
        setError(
          "Unable to send the reset email.",
        );
      }
    } finally {
      setSubmitting(false);
    }
  }


  return (
    <AuthLayout
      title="Reset your password"
      subtitle="Enter your email and we'll send you a password reset link."
    >
      <form
        onSubmit={handleSubmit}
        className="
          flex
          flex-col
          gap-4
        "
      >
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


        {sent && (
          <div
            className="
              rounded-[var(--borderRadius-sm)]

              bg-[var(--md-sys-color-primary-container)]

              px-3
              py-2

              text-xs

              text-[var(--md-sys-color-on-primary-container)]
            "
          >
            Reset email sent. Check your inbox.
          </div>
        )}


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
            ? "Sending..."
            : "Send Reset Link"}
        </button>


        <Link
          to="/login"
          className="
            mt-2

            flex
            items-center
            justify-center
            gap-2

            text-sm
            font-medium

            text-[var(--md-sys-color-outline)]

            hover:text-[var(--md-sys-color-on-surface)]
          "
        >
          <ArrowLeft size={15} />

          Back to sign in
        </Link>
      </form>
    </AuthLayout>
  );
}