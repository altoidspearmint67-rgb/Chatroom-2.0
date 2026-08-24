import {
  MessageCircle,
} from "lucide-react";

export function AuthLayout({
  title,
  subtitle,
  children,
}) {
  return (
    <div
      className="
        flex
        min-h-[100dvh]
        w-full
        items-center
        justify-center

        bg-[var(--md-sys-color-surface)]

        px-4
        py-8
      "
    >
      <div
        className="
          w-full
          max-w-[420px]
        "
      >
        {/* LOGO */}

        <div
          className="
            mb-7
            flex
            flex-col
            items-center
            text-center
          "
        >
          <div
            className="
              mb-3
              grid
              h-12
              w-12
              place-items-center

              rounded-[var(--borderRadius-lg)]

              bg-[var(--md-sys-color-primary-container)]

              text-[var(--md-sys-color-on-primary-container)]
            "
          >
            <MessageCircle
              size={25}
            />
          </div>

          <div
            className="
              text-2xl
              font-bold

              text-[var(--md-sys-color-on-surface)]
            "
          >
            Chatroom
          </div>
        </div>


        {/* CARD */}

        <div
          className="
            rounded-[var(--borderRadius-xl)]

            border
            border-[var(--md-sys-color-outline-variant)]

            bg-[var(--md-sys-color-surface-container-high)]

            p-6

            shadow-[0_12px_45px_rgba(0,0,0,0.28)]
          "
        >
          <div className="mb-6">
            <h1
              className="
                text-xl
                font-semibold

                text-[var(--md-sys-color-on-surface)]
              "
            >
              {title}
            </h1>

            {subtitle && (
              <p
                className="
                  mt-1.5

                  text-sm
                  leading-5

                  text-[var(--md-sys-color-outline)]
                "
              >
                {subtitle}
              </p>
            )}
          </div>

          {children}
        </div>
      </div>
    </div>
  );
}