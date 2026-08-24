import {
  createContext,
  useContext,
  useMemo,
  useRef,
} from "react";

const MessageCacheContext =
  createContext(null);

export function MessageCache({
  children,
}) {
  const cacheRef =
    useRef(new Map());

  const value = useMemo(
    () => ({
      manage(
        channelId,
        state,
      ) {
        cacheRef.current.set(
          channelId,
          state,
        );
      },

      unmanage(
        channelId,
      ) {
        const state =
          cacheRef.current.get(
            channelId,
          );

        if (state) {
          cacheRef.current.delete(
            channelId,
          );
        }

        return state;
      },

      peek(channelId) {
        return cacheRef.current.get(
          channelId,
        );
      },

      clear() {
        cacheRef.current.clear();
      },
    }),
    [],
  );

  return (
    <MessageCacheContext.Provider
      value={value}
    >
      {children}
    </MessageCacheContext.Provider>
  );
}

export function useMessageCache() {
  return useContext(
    MessageCacheContext,
  );
}