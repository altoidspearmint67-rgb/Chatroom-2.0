import {
  TextEmbed,
} from "./TextEmbed";

export function Embed({
  embed,
}) {
  if (!embed) {
    return null;
  }

  if (
    embed.type === "Image"
  ) {
    const src =
      embed.proxiedURL ||
      embed.url;

    return (
      <img
        src={src}
        alt=""
        loading="lazy"
        className="
          max-h-[420px]
          max-w-[560px]
          cursor-pointer
          rounded-lg
          object-contain
        "
      />
    );
  }

  if (
    embed.type === "Video"
  ) {
    return (
      <video
        controls
        playsInline
        preload="metadata"
        src={
          embed.proxiedURL ||
          embed.url
        }
        className="max-h-[420px] max-w-[560px] rounded-lg"
      />
    );
  }

  if (
    embed.type ===
      "Website" ||
    embed.type === "Text"
  ) {
    return (
      <TextEmbed
        embed={embed}
      />
    );
  }

  if (
    embed.type === "None"
  ) {
    return null;
  }

  return (
    <div className="text-xs text-white/35">
      Could not render{" "}
      {embed.type}
    </div>
  );
}