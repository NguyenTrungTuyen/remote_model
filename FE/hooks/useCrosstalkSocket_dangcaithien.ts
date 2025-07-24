"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { io, type Socket } from "socket.io-client";

interface CrosstalkSettings {
  display: string;
  mic: string;
  overlayMode: string;
  showTranscription: boolean;
  showTranslation: boolean;
  fromLang: string;
  toLang: string;
}

interface StatusUpdate {
  connected: boolean;
  isRunning: boolean;
  settings: CrosstalkSettings;
}

interface TextUpdate {
  transcription: string;
  translation: string;
}

interface StateUpdate {
  isRunning: boolean;
  mic: boolean;
  screenSize: [number, number];
  subtitlePosition: { x: number; y: number };
}

interface UseCrosstalkSocketReturn {
  isConnected: boolean;
  isRunning: boolean;
  settings: CrosstalkSettings;
  transcription: string;
  translation: string;
  state: StateUpdate;
  connectionError: string | null;
  start: () => void;
  stop: () => void;
  updateSettings: (settings: Partial<CrosstalkSettings>) => void;
  moveOverlay: (direction: "up" | "down" | "left" | "right") => void;
  connect: () => void;
  disconnect: () => void;
}

const defaultSettings: CrosstalkSettings = {
  display: "primary",
  mic: "default",
  overlayMode: "subtitle",
  showTranscription: true,
  showTranslation: true,
  fromLang: "en",
  toLang: "vi",
};

const defaultState: StateUpdate = {
  isRunning: false,
  mic: false,
  screenSize: [800, 600],
  subtitlePosition: { x: 0, y: 0 },
};

export function useCrosstalkSocket(
  socketUrl?: string,
  deviceId?: string,
): UseCrosstalkSocketReturn {
  const [isConnected, setIsConnected] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [settings, setSettings] = useState<CrosstalkSettings>(defaultSettings);
  const [transcription, setTranscription] = useState("");
  const [translation, setTranslation] = useState("");
  const [state, setState] = useState<StateUpdate>(defaultState);
  const [connectionError, setConnectionError] = useState<string | null>(null);

  const socketRef = useRef<Socket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const connectionAttempts = useRef(0);
  const maxReconnectAttempts = 3;

  // Default socket URL if not provided
  const defaultSocketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:3003";

  const clearReconnectTimeout = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
  }, []);

  const connectSocket = useCallback(() => {
    if (!socketUrl || !deviceId) {
      setConnectionError("Missing socket URL or device ID");
      return;
    }

    if (socketRef.current?.connected) {
      return;
    }

    if (connectionAttempts.current >= maxReconnectAttempts) {
      console.log("Max reconnection attempts reached");
      setConnectionError("Unable to connect to server after multiple attempts");
      return;
    }

    connectionAttempts.current++;
    console.log(
      `Attempting to connect to Crosstalk server (attempt ${connectionAttempts.current}):`,
      socketUrl,
    );

    try {
      const socket = io(socketUrl, {
        transports: ["websocket", "polling"],
        timeout: 10000,
        reconnection: false,
        forceNew: true,
        autoConnect: true,
        query: { type: "FE", deviceId }, // Gửi deviceId và type
      });

      socketRef.current = socket;

      socket.on("connect", () => {
        console.log("✅ Connected to Crosstalk server");
        setIsConnected(true);
        setConnectionError(null);
        connectionAttempts.current = 0;
        clearReconnectTimeout();
      });

      socket.on("disconnect", (reason) => {
        console.log("❌ Disconnected from Crosstalk server:", reason);
        setIsConnected(false);
        setIsRunning(false);

        if (reason !== "io client disconnect" && connectionAttempts.current < maxReconnectAttempts) {
          setConnectionError("Connection lost, attempting to reconnect...");
          reconnectTimeoutRef.current = setTimeout(() => {
            connectSocket();
          }, 3000);
        }
      });

      socket.on("connect_error", (error) => {
        console.warn("⚠️ Connection error:", error.message);
        setIsConnected(false);

        if (connectionAttempts.current >= maxReconnectAttempts) {
          setConnectionError("Cannot connect to server. Please check if the server is running.");
        } else {
          setConnectionError(
            `Connection failed (attempt ${connectionAttempts.current}/${maxReconnectAttempts})`,
          );
          reconnectTimeoutRef.current = setTimeout(() => {
            connectSocket();
          }, 2000);
        }
      });

      socket.on("status:update", (payload: StatusUpdate) => {
        console.log("📊 Status update received:", payload);
        setIsConnected(payload.connected);
        setIsRunning(payload.isRunning);
        setSettings((prev) => ({ ...prev, ...payload.settings }));
      });

      socket.on("text:update", (payload: TextUpdate) => {
        console.log("📝 Text update received:", payload);
        setTranscription(payload.transcription || "");
        setTranslation(payload.translation || "");
      });

      socket.on("state-update", (payload: StateUpdate) => {
        console.log("📡 State update received:", payload);
        setState(payload);
      });

      socket.on("error", (error) => {
        console.error("🔥 Socket error:", error);
        setConnectionError(`Socket error: ${error.message || error}`);
      });
    } catch (error) {
      console.error("🔥 Failed to create socket:", error);
      setConnectionError("Failed to initialize socket connection");
    }
  }, [socketUrl, deviceId, clearReconnectTimeout]);

  const disconnectSocket = useCallback(() => {
    console.log("🔌 Manually disconnecting from server");
    clearReconnectTimeout();
    connectionAttempts.current = 0;

    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
    }

    setIsConnected(false);
    setIsRunning(false);
    setConnectionError(null);
  }, [clearReconnectTimeout]);

  const start = useCallback(() => {
    if (!socketRef.current?.connected) {
      console.warn("⚠️ Cannot start: socket not connected");
      setConnectionError("Not connected to server");
      return;
    }

    console.log("▶️ Sending start command");
    socketRef.current.emit("control:start");
    setIsRunning(true);
  }, []);

  const stop = useCallback(() => {
    if (!socketRef.current?.connected) {
      console.warn("⚠️ Cannot stop: socket not connected");
      return;
    }

    console.log("⏹️ Sending stop command");
    socketRef.current.emit("control:stop");
    setIsRunning(false);
  }, []);

  const updateSettings = useCallback(
    (newSettings: Partial<CrosstalkSettings>) => {
      const updatedSettings = { ...settings, ...newSettings };
      setSettings(updatedSettings);

      if (!socketRef.current?.connected) {
        console.warn("⚠️ Cannot update settings: socket not connected");
        return;
      }

      console.log("⚙️ Sending settings update:", updatedSettings);
      socketRef.current.emit("settings:update", updatedSettings);
    },
    [settings],
  );

  const moveOverlay = useCallback((direction: "up" | "down" | "left" | "right") => {
    if (!socketRef.current?.connected) {
      console.warn("⚠️ Cannot move overlay: socket not connected");
      return;
    }

    console.log("🎯 Sending overlay move command:", direction);
    socketRef.current.emit("overlay:move", { direction });
  }, []);

  const connect = useCallback(() => {
    connectionAttempts.current = 0;
    setConnectionError(null);
    connectSocket();
  }, [connectSocket]);

  const disconnect = useCallback(() => {
    disconnectSocket();
  }, [disconnectSocket]);

  useEffect(() => {
    if (socketUrl && deviceId) {
      connectSocket();
    }

    return () => {
      disconnectSocket();
    };
  }, [connectSocket, disconnectSocket, socketUrl, deviceId]);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && !socketRef.current?.connected && connectionAttempts.current < maxReconnectAttempts) {
        console.log("👁️ Page visible, checking socket connection");
        connectSocket();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [connectSocket]);

  return {
    isConnected,
    isRunning,
    settings,
    transcription,
    translation,
    state,
    connectionError,
    start,
    stop,
    updateSettings,
    moveOverlay,
    connect,
    disconnect,
  };
}