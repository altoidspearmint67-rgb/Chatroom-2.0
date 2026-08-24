import {
  useMemo,
  useState,
} from "react";

import {
  Link,
} from "react-router-dom";


function getAuthorName(
  message,
) {
  if (
    message.author &&
    typeof message.author ===
      "object"
  ) {
    return (
      message.author
        .displayName ||
      message.author
        .username ||
      message.displayName ||
      message.username ||
      "Unknown"
    );
  }


  if (
    typeof message.author ===
    "string"
  ) {
    return message.author;
  }


  return (
    message.displayName ||
    message.username ||
    "Unknown"
  );
}


function getTimestamp(
  message,
) {
  if (
    typeof message.timestamp ===
    "number"
  ) {
    return message.timestamp;
  }


  if (
    message.createdAt instanceof
    Date
  ) {
    return message.createdAt.getTime();
  }


  if (
    message.createdAt &&
    typeof message.createdAt
      .toMillis ===
      "function"
  ) {
    return message.createdAt.toMillis();
  }


  const parsed =
    new Date(
      message.createdAt ||
      0,
    ).getTime();


  return Number.isNaN(
    parsed,
  )
    ? 0
    : parsed;
}


export function TextSearchSidebar({
  channel,
  query,
  messages = [],
}) {
  const [
    sort,
    setSort,
  ] = useState(
    query.sort ||
      "Latest",
  );


  const results =
    useMemo(() => {
      let filtered =
        [
          ...messages,
        ];


      /* =====================================================
         PIN FILTER
         ===================================================== */

      if (
        query.pinned
      ) {
        filtered =
          filtered.filter(
            (
              message,
            ) =>
              Boolean(
                message.pinned,
              ) &&
              !message.deleted,
          );
      }


      /* =====================================================
         TEXT SEARCH
         ===================================================== */

      if (
        query.query !==
        undefined
      ) {
        const search =
          String(
            query.query ||
            "",
          )
            .trim()
            .toLowerCase();


        if (search) {
          filtered =
            filtered.filter(
              (
                message,
              ) => {
                const content =
                  String(
                    message.content ||
                    "",
                  ).toLowerCase();


                const author =
                  getAuthorName(
                    message,
                  ).toLowerCase();


                return (
                  content.includes(
                    search,
                  ) ||
                  author.includes(
                    search,
                  )
                );
              },
            );
        }
      }


      /* =====================================================
         SORT
         ===================================================== */

      if (
        sort ===
        "Latest"
      ) {
        filtered.sort(
          (
            a,
            b,
          ) =>
            getTimestamp(
              b,
            ) -
            getTimestamp(
              a,
            ),
        );
      }


      if (
        sort ===
        "Oldest"
      ) {
        filtered.sort(
          (
            a,
            b,
          ) =>
            getTimestamp(
              a,
            ) -
            getTimestamp(
              b,
            ),
        );
      }


      return filtered;
    }, [
      messages,
      query,
      sort,
    ]);


  return (
    <div className="px-2">
      {!query.sort && (
        <div className="mb-3 flex">
          {[
            "Relevance",
            "Latest",
            "Oldest",
          ].map(
            (
              option,
            ) => (
              <button
                key={
                  option
                }
                type="button"
                onClick={() =>
                  setSort(
                    option,
                  )
                }
                className={[
                  "flex-1 border border-white/5 px-2 py-2 text-xs",

                  option ===
                  "Relevance"
                    ? "rounded-l-lg"
                    : "",

                  option ===
                  "Oldest"
                    ? "rounded-r-lg"
                    : "",

                  sort ===
                  option
                    ? "bg-[var(--md-sys-color-primary-container)] text-white"
                    : "bg-white/4 text-white/45 hover:bg-white/7",
                ].join(
                  " ",
                )}
              >
                {option}
              </button>
            ),
          )}
        </div>
      )}


      {results.length ===
        0 && (
        <div
          className="
            rounded-lg
            p-4
            text-center
            text-sm
            text-white/35
          "
        >
          {query.pinned
            ? "No pinned messages."
            : "No messages found."}
        </div>
      )}


      <div className="space-y-2">
        {results.map(
          (
            message,
          ) => {
            const authorName =
              getAuthorName(
                message,
              );


            const timestamp =
              getTimestamp(
                message,
              );


            return (
              <Link
                key={
                  message.id
                }
                to={`?message=${message.id}`}
                className="
                  block
                  rounded-xl
                  bg-white/4
                  p-3
                  transition
                  hover:bg-white/7
                "
              >
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-white">
                    {
                      authorName
                    }
                  </span>


                  <span className="text-[10px] text-white/30">
                    {timestamp
                      ? new Date(
                          timestamp,
                        ).toLocaleDateString()
                      : ""}
                  </span>
                </div>


                <div
                  className="
                    mt-1
                    line-clamp-4
                    text-sm
                    leading-5
                    text-white/60
                  "
                >
                  {message.deleted
                    ? "Message deleted"
                    : message.content}
                </div>
              </Link>
            );
          },
        )}
      </div>
    </div>
  );
}