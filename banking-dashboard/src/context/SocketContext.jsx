import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { io } from "socket.io-client";
import { useAuth } from "./AuthContext.jsx";

const SocketContext = createContext(null);

const SOCKET_PATH = "/socket.io";

function socketBaseUrl() {
  const v = import.meta.env.VITE_SOCKET_URL;
  if (v) return v.replace(/\/$/, "");
  return "";
}

export function SocketProvider({ children }) {
  const { user, loading } = useAuth();
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    if (loading || !user) {
      setSocket((prev) => {
        if (prev) prev.close();
        return null;
      });
      setConnected(false);
      return;
    }

    const token = localStorage.getItem("bank_token");
    if (!token) return;

    const s = io(socketBaseUrl(), {
      path: SOCKET_PATH,
      auth: { token },
      transports: ["websocket", "polling"],
      reconnectionAttempts: 8,
      reconnectionDelay: 800,
    });

    s.on("connect", () => setConnected(true));
    s.on("disconnect", () => setConnected(false));
    setSocket(s);

    return () => {
      s.close();
      setConnected(false);
    };
  }, [user, loading]);

  const value = useMemo(
    () => ({ socket, connected }),
    [socket, connected]
  );

  return (
    <SocketContext.Provider value={value}>{children}</SocketContext.Provider>
  );
}

export function useSocket() {
  const ctx = useContext(SocketContext);
  if (!ctx) throw new Error("useSocket requires SocketProvider");
  return ctx;
}
