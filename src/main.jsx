import {
  StrictMode,
} from "react";

import {
  createRoot,
} from "react-dom/client";

import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
} from "react-router-dom";

import {
  AuthProvider,
} from "./auth/AuthContext";

import {
  ForgotPassword,
} from "./auth/ForgotPassword";

import {
  Login,
} from "./auth/Login";

import {
  ProtectedRoute,
} from "./auth/ProtectedRoute";

import {
  SignUp,
} from "./auth/SignUp";

import Interface from "./Interface";

import {
  Friends,
} from "./interface/Friends";

import {
  HomePage,
} from "./interface/Home";

import {
  Settings,
} from "./interface/Settings";

import {
  ChannelPage,
} from "./interface/channels/ChannelPage";

import {
  MessageCache,
} from "./interface/channels/text/MessageCache";

import "./index.css";


function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* PUBLIC */}

        <Route
          path="/login"
          element={<Login />}
        />

        <Route
          path="/signup"
          element={<SignUp />}
        />

        <Route
          path="/forgot-password"
          element={
            <ForgotPassword />
          }
        />


        {/* AUTHENTICATED CHATROOM */}

        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Interface />
            </ProtectedRoute>
          }
        >
          <Route
            index
            element={
              <HomePage />
            }
          />

          <Route
            path="friends"
            element={
              <Friends />
            }
          />

          <Route
            path="settings"
            element={
              <Settings />
            }
          />

          <Route
            path="channel/:channel/*"
            element={
              <ChannelPage />
            }
          />

          <Route
            path="*"
            element={
              <Navigate
                to="/"
                replace
              />
            }
          />
        </Route>

      </Routes>
    </BrowserRouter>
  );
}


createRoot(
  document.getElementById(
    "root",
  ),
).render(
  <StrictMode>
    <AuthProvider>
      <MessageCache>
        <App />
      </MessageCache>
    </AuthProvider>
  </StrictMode>,
);