import {
  File as FileIcon,
  FileAudio,
  FileText,
} from "lucide-react";

import {
  useEffect,
  useState,
} from "react";

function getAttachmentUrl(
  file,
) {
  return (
    file.url ||
    file.originalUrl ||
    file.src ||
    file.dataUri
  );
}

export function Attachment({
  file,
}) {
  const [
    objectUrl,
    setObjectUrl,
  ] = useState(null);

  const nativeFile =
    typeof File !==
      "undefined" &&
    file instanceof File;

  useEffect(() => {
    if (!nativeFile) {
      return;
    }

    const url =
      URL.createObjectURL(
        file,
      );

    setObjectUrl(url);

    return () =>
      URL.revokeObjectURL(
        url,
      );
  }, [
    file,
    nativeFile,
  ]);

  const url =
    objectUrl ||
    getAttachmentUrl(
      file,
    );

  const type =
    nativeFile
      ? file.type
      : file.type ||
        file.metadata?.type ||
        "";

  const name =
    file.name ||
    file.filename ||
    "Attachment";

  if (
    type === "Image" ||
    type.startsWith?.(
      "image/",
    )
  ) {
    return (
      <img
        src={url}
        alt={name}
        loading="lazy"
        className="
          max-h-[420px]
          max-w-[560px]
          cursor-pointer
          rounded-lg
          object-contain
        "
        onClick={() =>
          window.open(
            url,
            "_blank",
          )
        }
      />
    );
  }

  if (
    type === "Video" ||
    type.startsWith?.(
      "video/",
    )
  ) {
    return (
      <video
        controls
        playsInline
        preload="metadata"
        src={url}
        className="
          max-h-[420px]
          max-w-[560px]
          rounded-lg
        "
      />
    );
  }

  if (
    type === "Audio" ||
    type.startsWith?.(
      "audio/",
    )
  ) {
    return (
      <AttachmentCard>
        <div className="flex items-center gap-2">
          <FileAudio
            size={18}
          />

          <span>
            {name}
          </span>
        </div>

        <audio
          controls
          src={url}
          className="w-[360px]"
        />
      </AttachmentCard>
    );
  }

  if (
    type === "Text" ||
    type.startsWith?.(
      "text/",
    )
  ) {
    return (
      <AttachmentCard>
        <div className="flex items-center gap-2">
          <FileText
            size={18}
          />

          <span>
            {name}
          </span>
        </div>
      </AttachmentCard>
    );
  }

  return (
    <AttachmentCard>
      <div className="flex items-center gap-2">
        <FileIcon size={18} />

        <span className="truncate">
          {name}
        </span>
      </div>
    </AttachmentCard>
  );
}

function AttachmentCard({
  children,
}) {
  return (
    <div
      className="
        flex
        w-fit
        max-w-[480px]
        flex-col
        gap-2
        rounded-lg
        bg-[var(--md-sys-color-inverse-surface,#2b2b2b)]
        p-2
        text-sm
        text-white/75
      "
    >
      {children}
    </div>
  );
}