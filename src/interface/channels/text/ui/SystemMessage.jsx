function mention(id) {
  return `@${id || "user"}`;
}

export function SystemMessage({
  systemMessage,
  isServer = false,
}) {
  if (!systemMessage) {
    return null;
  }

  let text;

  switch (
    systemMessage.type
  ) {
    case "user_added":
      text =
        `${mention(
          systemMessage.userId,
        )} has been added by ${mention(
          systemMessage.byId,
        )}`;
      break;

    case "user_remove":
      text =
        `${mention(
          systemMessage.userId,
        )} has been removed by ${mention(
          systemMessage.byId,
        )}`;
      break;

    case "user_kicked":
      text =
        `${mention(
          systemMessage.userId,
        )} has been kicked from the server`;
      break;

    case "user_banned":
      text =
        `${mention(
          systemMessage.userId,
        )} has been banned from the server`;
      break;

    case "user_joined":
      text =
        `${mention(
          systemMessage.userId,
        )} joined the server`;
      break;

    case "user_left":
      text =
        `${mention(
          systemMessage.userId,
        )} left the ${
          isServer
            ? "server"
            : "group"
        }`;
      break;

    case "channel_renamed":
      text =
        `${mention(
          systemMessage.byId,
        )} updated the group name to ${systemMessage.name}`;
      break;

    case "channel_description_changed":
      text =
        `${mention(
          systemMessage.byId,
        )} updated the group description`;
      break;

    case "channel_icon_changed":
      text =
        `${mention(
          systemMessage.byId,
        )} updated the group icon`;
      break;

    case "channel_ownership_changed":
      text =
        `${mention(
          systemMessage.fromId,
        )} transferred group ownership to ${mention(
          systemMessage.toId,
        )}`;
      break;

    case "message_pinned":
      text =
        `${mention(
          systemMessage.byId,
        )} pinned a message`;
      break;

    case "message_unpinned":
      text =
        `${mention(
          systemMessage.byId,
        )} unpinned a message`;
      break;

    case "call_started":
      text =
        `${mention(
          systemMessage.byId,
        )} started a call`;
      break;

    case "text":
      text =
        systemMessage.content;
      break;

    default:
      text =
        systemMessage.type;
  }

  return (
    <div
      className="
        min-h-5
        text-sm
        italic
        text-white/45
      "
    >
      {text}
    </div>
  );
}