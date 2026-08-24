import {
  Navigate,
  useLocation,
} from "react-router-dom";

import {
  useAuth,
} from "./AuthContext";


export function ProtectedRoute({
  children,
}) {
  const {
    user,
    loading,
  } = useAuth();

  const location =
    useLocation();


  if (loading) {
    return (
      <div
        className="
          flex
          h-full
          w-full
          items-center
          justify-center

          bg-[var(--md-sys-color-surface)]

          text-sm

          text-[var(--md-sys-color-outline)]
        "
      >
        Loading Chatroom...
      </div>
    );
  }


  if (!user) {
    return (
      <Navigate
        to="/login"
        replace
        state={{
          from:
            location.pathname,
        }}
      />
    );
  }


  return children;
}