import {
  useEffect,
  useRef,
  useState,
} from "react";

export function EditMessage({
  message,
  onSave,
  onCancel,
}) {
  const [content, setContent] =
    useState(
      message.content || "",
    );

  const [saving, setSaving] =
    useState(false);

  const inputRef =
    useRef(null);

  useEffect(() => {
    inputRef.current?.focus();

    inputRef.current?.select();
  }, []);

  async function saveMessage() {
    const next =
      content.trim();

    if (!next) {
      return;
    }

    if (
      next ===
      message.content
    ) {
      onCancel?.();

      return;
    }

    try {
      setSaving(true);

      await onSave?.(
        next,
      );
    } finally {
      setSaving(false);
    }
  }

  function onKeyDown(
    event,
  ) {
    if (
      event.key ===
      "Escape"
    ) {
      event.preventDefault();

      onCancel?.();

      return;
    }

    if (
      event.key ===
        "Enter" &&
      !event.shiftKey
    ) {
      event.preventDefault();

      saveMessage();
    }
  }

  return (
    <div className="mt-1">
      <div
        className="
          rounded-lg
          bg-[var(--md-sys-color-surface-container-highest)]
          p-2
        "
      >
        <textarea
          ref={inputRef}
          value={content}
          rows={2}
          onChange={(
            event,
          ) =>
            setContent(
              event.target
                .value,
            )
          }
          onKeyDown={
            onKeyDown
          }
          className="
            max-h-40
            min-h-[44px]
            w-full
            resize-none
            bg-transparent
            text-sm
            leading-5
            text-white
            outline-none
          "
        />
      </div>

      <div className="mt-1 text-xs text-white/40">
        {saving ? (
          "Saving message..."
        ) : (
          <>
            escape to{" "}
            <button
              type="button"
              onClick={
                onCancel
              }
              className="font-semibold text-[var(--md-sys-color-primary)]"
            >
              cancel
            </button>{" "}
            · enter to{" "}
            <button
              type="button"
              onClick={
                saveMessage
              }
              className="font-semibold text-[var(--md-sys-color-primary)]"
            >
              save
            </button>
          </>
        )}
      </div>
    </div>
  );
}