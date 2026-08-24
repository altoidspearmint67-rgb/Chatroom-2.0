import {
  useEffect,
  useRef,
  useState,
} from "react";

import {
  Image as ImageIcon,
  Plus,
  Send,
  Smile,
} from "lucide-react";

import {
  FileCarousel,
  MessageBox,
  MessageReplyPreview,
} from "./ui";


const MAX_MESSAGE_LENGTH =
  2000;

const MAX_ATTACHMENTS =
  5;


/*
 * TEMPORARY:
 *
 * false =
 * hide + disable:
 * - attachments
 * - image/GIF
 * - emoji
 *
 * Change this to true later
 * if we decide to use them.
 */

const SHOW_MEDIA_ACTIONS =
  false;


export function MessageComposition({
  channel,

  onMessageSend,

  onTyping,

  onEditLastMessage,

  replyingTo,

  onCancelReply,
}) {
  const [
    content,
    setContent,
  ] = useState("");


  const [
    files,
    setFiles,
  ] = useState([]);


  const [
    mentionReply,
    setMentionReply,
  ] = useState(true);


  const fileInputRef =
    useRef(null);


  useEffect(() => {
    setMentionReply(
      true,
    );
  }, [
    replyingTo,
  ]);


  const messageLength =
    content.length;


  const almostTooLong =
    messageLength >
    MAX_MESSAGE_LENGTH -
      200;


  const tooLong =
    messageLength >
    MAX_MESSAGE_LENGTH;


  const wayTooLong =
    messageLength >
    MAX_MESSAGE_LENGTH +
      9999;


  /*
   * Upload system remains here,
   * but is disabled while media
   * controls are hidden.
   */

  const canUpload =
    SHOW_MEDIA_ACTIONS &&
    channel.canUpload !==
      false;


  const sendingAllowed =
    channel.canSend !==
    false;


  const canSend =
    sendingAllowed &&
    !tooLong &&
    (
      content.trim()
        .length >
        0 ||
      files.length >
        0
    );


  function addFiles(
    selectedFiles,
  ) {
    if (
      !canUpload ||
      !selectedFiles
    ) {
      return;
    }


    const nextFiles =
      Array.from(
        selectedFiles,
      );


    if (
      nextFiles.length ===
      0
    ) {
      return;
    }


    setFiles(
      (current) => [
        ...current,
        ...nextFiles,
      ],
    );
  }


  function removeFile(
    index,
  ) {
    setFiles(
      (current) =>
        current.filter(
          (
            _,
            fileIndex,
          ) =>
            fileIndex !==
            index,
        ),
    );
  }


  function addFile() {
    if (!canUpload) {
      return;
    }


    fileInputRef.current?.click();
  }


  function sendMessage() {
    if (!canSend) {
      return;
    }


    onMessageSend?.(
      content,
      files,

      replyingTo
        ? {
            message:
              replyingTo,

            mention:
              mentionReply,
          }
        : undefined,
    );


    setContent("");
    setFiles([]);


    if (
      replyingTo
    ) {
      onCancelReply?.();
    }
  }


  /*
   * Kept for possible future use.
   */

  function addEmoji() {
    setContent(
      (current) =>
        `${current}🙂`,
    );
  }


  function onDrop(
    event,
  ) {
    event.preventDefault();


    if (!canUpload) {
      return;
    }


    if (
      event.dataTransfer
        ?.files?.length
    ) {
      addFiles(
        event.dataTransfer
          .files,
      );
    }
  }


  function onPaste(
    event,
  ) {
    if (!canUpload) {
      return;
    }


    const pastedFiles =
      event.clipboardData
        ?.files;


    if (
      pastedFiles?.length
    ) {
      addFiles(
        pastedFiles,
      );
    }
  }


  const placeholder =
    channel.type ===
    "SavedMessages"
      ? "Save to your notes"
      : channel.type ===
          "DirectMessage"
        ? `Message ${
            channel.recipient
              ?.username ||
            ""
          }`
        : `Message ${
            channel.name ||
            ""
          }`;


  const replyIsSelf =
    replyingTo?.author
      ?.self ||
    replyingTo?.author ===
      "You";


  return (
    <div
      className="
        shrink-0
        px-3
        pb-1
      "
      onDragOver={(
        event,
      ) => {
        event.preventDefault();
      }}
      onDrop={
        onDrop
      }
      onPaste={
        onPaste
      }
    >
      {/* ===================================================
          FILE INPUT

          Still exists.
          Currently inaccessible while SHOW_MEDIA_ACTIONS
          is false.
          =================================================== */}

      <input
        ref={
          fileInputRef
        }
        type="file"
        multiple
        className="hidden"
        onChange={(
          event,
        ) => {
          if (
            event.target.files
              ?.length
          ) {
            addFiles(
              event.target
                .files,
            );
          }


          event.target.value =
            "";
        }}
      />


      {/* ===================================================
          REPLY PREVIEW
          =================================================== */}

      {replyingTo && (
        <MessageReplyPreview
          message={
            replyingTo
          }
          mention={
            mentionReply
          }
          self={
            Boolean(
              replyIsSelf,
            )
          }
          toggle={() =>
            setMentionReply(
              (current) =>
                !current,
            )
          }
          dismiss={() =>
            onCancelReply?.()
          }
        />
      )}


      {/* ===================================================
          FILE CAROUSEL

          Code remains but no files can currently
          be added while media actions are disabled.
          =================================================== */}

      {SHOW_MEDIA_ACTIONS && (
        <FileCarousel
          files={
            files
          }
          addFile={
            addFile
          }
          removeFile={
            removeFile
          }
          maxAttachments={
            MAX_ATTACHMENTS
          }
        />
      )}


      <MessageBox
        content={
          content
        }
        setContent={
          setContent
        }
        onSendMessage={
          sendMessage
        }
        onTyping={() =>
          onTyping?.()
        }
        onEditLastMessage={() =>
          onEditLastMessage?.()
        }
        placeholder={
          placeholder
        }
        sendingAllowed={
          sendingAllowed
        }
        hasActionsAppend={
          false
        }
        actionsAppend={
          null
        }

        /* ===============================================
           ATTACHMENT BUTTON

           Kept in code, hidden while flag is false.
           =============================================== */

        actionsStart={
          SHOW_MEDIA_ACTIONS ? (
            canUpload ? (
              <button
                type="button"
                title="Add attachment"
                onClick={
                  addFile
                }
                className="
                  grid
                  h-10
                  w-10
                  shrink-0
                  place-items-center
                  rounded-lg
                  text-white/45
                  transition
                  hover:bg-white/7
                  hover:text-white
                "
              >
                <Plus
                  size={21}
                />
              </button>
            ) : (
              <div
                className="
                  w-[14px]
                  shrink-0
                "
              />
            )
          ) : null
        }

        actionsEnd={
          <div
            className="
              flex
              shrink-0
              items-end
            "
          >
            {/* ===========================================
                IMAGE / GIF + EMOJI

                Both remain in code.
                Currently hidden.
                =========================================== */}

            {SHOW_MEDIA_ACTIONS && (
              <>
                {!canSend && (
                  <button
                    type="button"
                    title="GIF"
                    onClick={() =>
                      window.alert(
                        "GIF picker goes here.",
                      )
                    }
                    className="
                      grid
                      h-10
                      w-10
                      place-items-center
                      rounded-lg
                      text-white/45
                      transition
                      hover:bg-white/7
                      hover:text-white
                    "
                  >
                    <ImageIcon
                      size={19}
                    />
                  </button>
                )}


                <button
                  type="button"
                  title="Emoji"
                  onClick={
                    addEmoji
                  }
                  className="
                    grid
                    h-10
                    w-10
                    place-items-center
                    rounded-lg
                    text-white/45
                    transition
                    hover:bg-white/7
                    hover:text-white
                  "
                >
                  <Smile
                    size={19}
                  />
                </button>
              </>
            )}


            {almostTooLong && (
              <div
                className={[
                  "flex h-10 items-center px-2 text-xs font-semibold",

                  tooLong
                    ? "text-[var(--md-sys-color-error)]"
                    : "text-white/40",
                ].join(
                  " ",
                )}
              >
                {wayTooLong
                  ? "Too Long"
                  : MAX_MESSAGE_LENGTH -
                    messageLength}
              </div>
            )}


            {/* SEND STAYS VISIBLE */}

            <button
              type="button"
              title="Send message"
              disabled={
                !canSend
              }
              onClick={
                sendMessage
              }
              className={[
                "grid h-10 w-10 place-items-center rounded-lg transition",

                canSend
                  ? "text-[var(--md-sys-color-primary)] hover:bg-white/7"
                  : "cursor-default text-white/15",
              ].join(
                " ",
              )}
            >
              <Send
                size={19}
              />
            </button>
          </div>
        }
      />
    </div>
  );
}