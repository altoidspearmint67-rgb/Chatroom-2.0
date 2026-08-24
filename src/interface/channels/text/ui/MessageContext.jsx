import {
  createContext,
  useContext,
} from "react";

const MessageContext =
  createContext(null);

export function MessageProvider({
  value,
  children,
}) {
  return (
    <MessageContext.Provider
      value={value}
    >
      {children}
    </MessageContext.Provider>
  );
}

export function useMessage() {
  return useContext(
    MessageContext,
  );
}