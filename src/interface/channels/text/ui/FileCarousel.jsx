import {
  File,
  Plus,
  X,
} from "lucide-react";

import {
  useEffect,
  useState,
} from "react";

export function determineFileSize(
  size,
) {
  if (size > 1e6) {
    return `${(
      size / 1e6
    ).toFixed(2)} MB`;
  }

  if (size > 1e3) {
    return `${(
      size / 1e3
    ).toFixed(2)} KB`;
  }

  return `${size} B`;
}

function Preview({
  file,
}) {
  const [src, setSrc] =
    useState(null);

  useEffect(() => {
    if (
      !file.type?.startsWith(
        "image/",
      )
    ) {
      return;
    }

    const url =
      URL.createObjectURL(
        file,
      );

    setSrc(url);

    return () =>
      URL.revokeObjectURL(
        url,
      );
  }, [file]);

  if (src) {
    return (
      <img
        src={src}
        alt={file.name}
        className="
          h-[100px]
          w-[100px]
          rounded-lg
          object-cover
        "
      />
    );
  }

  return (
    <div
      className="
        grid
        h-[100px]
        w-[100px]
        place-items-center
        rounded-lg
        bg-white/7
      "
    >
      <File size={34} />
    </div>
  );
}

export function FileCarousel({
  files = [],

  addFile,

  removeFile,

  maxAttachments = 5,
}) {
  if (
    files.length === 0
  ) {
    return null;
  }

  return (
    <div
      className="
        my-2
        flex
        select-none
        flex-col
        rounded-xl
        bg-[var(--md-sys-color-primary-container)]
        p-2
        text-[var(--md-sys-color-on-primary-container)]
      "
    >
      <div
        className="
          flex
          gap-2
          overflow-x-auto
        "
      >
        {files.map(
          (
            file,
            index,
          ) => (
            <div
              key={`${file.name}-${index}`}
              className={[
                "flex shrink-0 flex-col items-center",

                index >=
                maxAttachments
                  ? "opacity-40"
                  : "",
              ].join(" ")}
            >
              <button
                type="button"
                onClick={() =>
                  removeFile?.(
                    index,
                  )
                }
                className="group relative"
              >
                <Preview
                  file={file}
                />

                <div
                  className="
                    absolute
                    inset-0
                    grid
                    place-items-center
                    rounded-lg
                    bg-black/70
                    opacity-0
                    transition
                    group-hover:opacity-100
                  "
                >
                  <X
                    size={30}
                  />
                </div>
              </button>

              <div
                className="
                  mt-1
                  max-w-[100px]
                  truncate
                  text-xs
                  font-semibold
                "
              >
                {file.name}
              </div>

              <div className="text-[10px] text-white/45">
                {determineFileSize(
                  file.size,
                )}
              </div>
            </div>
          ),
        )}

        <button
          type="button"
          onClick={addFile}
          className="
            grid
            h-[100px]
            w-[100px]
            shrink-0
            place-items-center
            rounded-lg
            bg-white/7
            text-white/60
            hover:bg-white/10
            hover:text-white
          "
        >
          <Plus size={34} />
        </button>
      </div>
    </div>
  );
}