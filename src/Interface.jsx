import { useEffect, useState } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";

import { Sidebar } from "./interface/Sidebar";

export default function Interface() {
  const location = useLocation();

  // Replace this later with your actual authentication state.
  const [isLoggedIn] = useState(true);

  // Equivalent idea to lifecycle.loadedOnce()
  const [loadedOnce, setLoadedOnce] = useState(false);

  // Equivalent idea to Revolt connection state.
  const [disconnected] = useState(false);

  useEffect(() => {
    setLoadedOnce(true);
  }, []);

  useEffect(() => {
    if (!isLoggedIn) {
      localStorage.setItem("nextPath", location.pathname);
    }
  }, [isLoggedIn, location.pathname]);

  if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="app_root flex h-screen flex-col">
      {/* Original Revolt Titlebar */}
      <Titlebar />

      {!loadedOnce ? (
        <LoadingScreen />
      ) : (
        <div
          className={[
            "flex min-h-0 min-w-0 flex-1",
            disconnected
              ? "bg-[var(--md-sys-color-primary-container)] text-[var(--md-sys-color-on-primary-container)]"
              : "bg-[var(--md-sys-color-surface-container-high)] text-[var(--md-sys-color-outline)]",
          ].join(" ")}
          onDragOver={(event) => {
            if (event.dataTransfer) {
              event.dataTransfer.dropEffect = "none";
            }
          }}
          onDrop={(event) => event.preventDefault()}
        >
          <Sidebar />

          <main className="app_body flex min-w-0 w-full bg-[var(--md-sys-color-surface-container-low)]">
            <Outlet />
          </main>
        </div>
      )}

      <NotificationsWorker />
    </div>
  );
}

function Titlebar() {
  return null;
}

function LoadingScreen() {
  return (
    <div className="flex flex-1 items-center justify-center">
      Loading...
    </div>
  );
}

function NotificationsWorker() {
  return null;
}