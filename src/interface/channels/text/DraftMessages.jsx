import {
  DraftMessage,
} from "./DraftMessage";

export function DraftMessages({
  drafts = [],

  tail = false,

  sentIds = [],

  onRetry,

  onDiscard,
}) {
  const unsent =
    drafts
      .filter(
        (draft) =>
          draft.status ===
          "sending",
      )
      .filter(
        (draft) =>
          !sentIds.includes(
            draft.idempotencyKey,
          ),
      );

  const failed =
    drafts.filter(
      (draft) =>
        draft.status !==
        "sending",
    );

  return (
    <>
      {unsent.map(
        (
          draft,
          index,
        ) => (
          <DraftMessage
            key={
              draft.id
            }
            draft={draft}
            tail={
              index !== 0 ||
              tail
            }
            onRetry={
              onRetry
            }
            onDiscard={
              onDiscard
            }
          />
        ),
      )}

      {failed.map(
        (draft) => (
          <DraftMessage
            key={
              draft.id
            }
            draft={draft}
            onRetry={
              onRetry
            }
            onDiscard={
              onDiscard
            }
          />
        ),
      )}
    </>
  );
}