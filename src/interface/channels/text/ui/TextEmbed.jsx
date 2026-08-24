export function TextEmbed({
  embed,
}) {
  const image =
    embed.image;

  const video =
    embed.video;

  return (
    <div
      className="
        flex
        w-fit
        max-w-[420px]
        gap-2
        rounded-lg
        border-l-4
        border-[var(--md-sys-color-primary)]
        bg-[var(--md-sys-color-primary-container)]
        p-2
        text-[var(--md-sys-color-on-primary-container)]
      "
      style={{
        borderColor:
          embed.colour ||
          undefined,
      }}
    >
      <div className="min-w-0 flex-1">
        {(embed.siteName ||
          embed.iconUrl) && (
          <div className="mb-2 flex items-center gap-2 text-xs">
            {embed.iconUrl && (
              <img
                src={
                  embed.iconUrl
                }
                alt=""
                className="h-3.5 w-3.5"
              />
            )}

            <span className="truncate">
              {
                embed.siteName
              }
            </span>
          </div>
        )}

        {embed.title && (
          <a
            href={
              embed.url
            }
            target="_blank"
            rel="noreferrer"
            className="
              block
              truncate
              text-base
              text-[var(--md-sys-color-primary)]
              hover:underline
            "
          >
            {embed.title}
          </a>
        )}

        {embed.description && (
          <div
            className="
              mt-1
              overflow-hidden
              break-words
              text-xs
              text-white/65
            "
          >
            {
              embed.description
            }
          </div>
        )}

        {video && (
          <video
            controls
            playsInline
            preload="metadata"
            src={
              video.proxiedURL ||
              video.url
            }
            className="mt-2 max-h-[300px] rounded-lg"
          />
        )}

        {image?.size ===
          "Large" && (
          <img
            src={
              image.proxiedURL ||
              image.url
            }
            alt=""
            loading="lazy"
            className="mt-2 max-h-[320px] cursor-pointer rounded-lg object-contain"
          />
        )}
      </div>

      {image?.size ===
        "Preview" &&
        !video && (
          <img
            src={
              image.proxiedURL ||
              image.url
            }
            alt=""
            loading="lazy"
            className="
              max-h-[120px]
              max-w-[120px]
              rounded-lg
              object-cover
            "
          />
        )}
    </div>
  );
}