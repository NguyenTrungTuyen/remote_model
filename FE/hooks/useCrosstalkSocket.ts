"use client"

import { useEffect, useState, useCallback, useRef } from "react"
import { io, type Socket } from "socket.io-client"

interface CrosstalkSettings {
  displayScreen: string
  microphone: string
  overlayMode: string
  showTranscription: boolean
  showTranslation: boolean
  fromLanguage: string
  toLanguage: string
}

interface StatusUpdate {
  connected: boolean
  isRunning: boolean
  settings: CrosstalkSettings
}

interface TextUpdate {
  transcription: string
  translation: string
}

interface UseCrosstalkSocketReturn {
  isConnected: boolean
  isRunning: boolean
  settings: CrosstalkSettings
  transcription: string
  translation: string
  connectionError: string | null
  start: () => void
  stop: () => void
  updateSettings: (settings: Partial<CrosstalkSettings>) => void
  moveOverlay: (direction: "up" | "down" | "left" | "right") => void
  connect: () => void
  disconnect: () => void
}

const defaultSettings: CrosstalkSettings = {
  displayScreen: "primary",
  microphone: "default",
  overlayMode: "subtitle",
  showTranscription: true,
  showTranslation: true,
  fromLanguage: "en",
  toLanguage: "vi",
}

export function useCrosstalkSocket(): UseCrosstalkSocketReturn {
  const [isConnected, setIsConnected] = useState(false)
  const [isRunning, setIsRunning] = useState(false)
  const [settings, setSettings] = useState<CrosstalkSettings>(defaultSettings)
  const [transcription, setTranscription] = useState("")
  const [translation, setTranslation] = useState("")
  const [connectionError, setConnectionError] = useState<string | null>(null)

  const socketRef = useRef<Socket | null>(null)
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const connectionAttempts = useRef(0)
  const maxReconnectAttempts = 3

  // Get socket URL from environment or use default
  const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:4000"

  const clearReconnectTimeout = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current)
      reconnectTimeoutRef.current = null
    }
  }, [])

  const connectSocket = useCallback(() => {
    // Don't create multiple connections
    if (socketRef.current?.connected) {
      return
    }

    // Limit reconnection attempts
    if (connectionAttempts.current >= maxReconnectAttempts) {
      console.log("Max reconnection attempts reached")
      setConnectionError("Unable to connect to server after multiple attempts")
      return
    }

    connectionAttempts.current++
    console.log(`Attempting to connect to Crosstalk server (attempt ${connectionAttempts.current}):`, socketUrl)

    try {
      const socket = io(socketUrl, {
        transports: ["websocket", "polling"],
        timeout: 10000,
        reconnection: false, // We'll handle reconnection manually
        forceNew: true,
        autoConnect: true,
      })

      socketRef.current = socket

      // Connection success
      socket.on("connect", () => {
        console.log("✅ Connected to Crosstalk server")
        setIsConnected(true)
        setConnectionError(null)
        connectionAttempts.current = 0 // Reset attempts on successful connection
        clearReconnectTimeout()
      })

      // Connection failed
      socket.on("disconnect", (reason) => {
        console.log("❌ Disconnected from Crosstalk server:", reason)
        setIsConnected(false)
        setIsRunning(false)

        // Only attempt reconnection for unexpected disconnects
        if (reason !== "io client disconnect" && connectionAttempts.current < maxReconnectAttempts) {
          setConnectionError("Connection lost, attempting to reconnect...")
          reconnectTimeoutRef.current = setTimeout(() => {
            connectSocket()
          }, 3000)
        }
      })

      // Connection error
      socket.on("connect_error", (error) => {
        console.warn("⚠️ Connection error:", error.message)
        setIsConnected(false)

        if (connectionAttempts.current >= maxReconnectAttempts) {
          setConnectionError("Cannot connect to server. Please check if the server is running.")
        } else {
          setConnectionError(`Connection failed (attempt ${connectionAttempts.current}/${maxReconnectAttempts})`)
          // Retry after delay
          reconnectTimeoutRef.current = setTimeout(() => {
            connectSocket()
          }, 2000)
        }
      })

      // Data event handlers
      socket.on("status:update", (payload: StatusUpdate) => {
        console.log("📊 Status update received:", payload)
        setIsConnected(payload.connected)
        setIsRunning(payload.isRunning)
        setSettings((prev) => ({ ...prev, ...payload.settings }))
      })

      socket.on("text:update", (payload: TextUpdate) => {
        console.log("📝 Text update received:", payload)
        setTranscription(payload.transcription || "")
        setTranslation(payload.translation || "")
      })

      // General error handling
      socket.on("error", (error) => {
        console.error("🔥 Socket error:", error)
        setConnectionError(`Socket error: ${error.message || error}`)
      })
    } catch (error) {
      console.error("🔥 Failed to create socket:", error)
      setConnectionError("Failed to initialize socket connection")
    }
  }, [socketUrl, clearReconnectTimeout])

  const disconnectSocket = useCallback(() => {
    console.log("🔌 Manually disconnecting from server")

    clearReconnectTimeout()
    connectionAttempts.current = 0

    if (socketRef.current) {
      socketRef.current.disconnect()
      socketRef.current = null
    }

    setIsConnected(false)
    setIsRunning(false)
    setConnectionError(null)
  }, [clearReconnectTimeout])

  // Control functions with connection checks
  const start = useCallback(() => {
    if (!socketRef.current?.connected) {
      console.warn("⚠️ Cannot start: socket not connected")
      setConnectionError("Not connected to server")
      return
    }

    console.log("▶️ Sending start command")
    socketRef.current.emit("control:start")
    setIsRunning(true)
  }, [])

  const stop = useCallback(() => {
    if (!socketRef.current?.connected) {
      console.warn("⚠️ Cannot stop: socket not connected")
      return
    }

    console.log("⏹️ Sending stop command")
    socketRef.current.emit("control:stop")
    setIsRunning(false)
  }, [])

  const updateSettings = useCallback(
    (newSettings: Partial<CrosstalkSettings>) => {
      const updatedSettings = { ...settings, ...newSettings }
      setSettings(updatedSettings)

      if (!socketRef.current?.connected) {
        console.warn("⚠️ Cannot update settings: socket not connected")
        return
      }

      console.log("⚙️ Sending settings update:", updatedSettings)
      socketRef.current.emit("settings:update", {
        display: updatedSettings.displayScreen,
        mic: updatedSettings.microphone,
        overlayMode: updatedSettings.overlayMode,
        showTranscription: updatedSettings.showTranscription,
        showTranslation: updatedSettings.showTranslation,
        fromLang: updatedSettings.fromLanguage,
        toLang: updatedSettings.toLanguage,
      })
    },
    [settings],
  )

  const moveOverlay = useCallback((direction: "up" | "down" | "left" | "right") => {
    if (!socketRef.current?.connected) {
      console.warn("⚠️ Cannot move overlay: socket not connected")
      return
    }

    console.log("🎯 Sending overlay move command:", direction)
    socketRef.current.emit("overlay:move", { direction })
  }, [])

  // Manual connection control
  const connect = useCallback(() => {
    connectionAttempts.current = 0
    setConnectionError(null)
    connectSocket()
  }, [connectSocket])

  const disconnect = useCallback(() => {
    disconnectSocket()
  }, [disconnectSocket])

  // Initialize socket connection on mount (only if URL is configured)
  useEffect(() => {
    // Only auto-connect if we have a custom socket URL or in production
    const shouldAutoConnect = process.env.NEXT_PUBLIC_SOCKET_URL || process.env.NODE_ENV === "production"

    if (shouldAutoConnect) {
      connectSocket()
    } else {
      console.log("🔧 Development mode: Socket auto-connect disabled. Use connect() to manually connect.")
      setConnectionError("Socket connection disabled in development. Click to connect manually.")
    }

    // Cleanup on unmount
    return () => {
      disconnectSocket()
    }
  }, [connectSocket, disconnectSocket])

  // Handle page visibility changes
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && !socketRef.current?.connected && connectionAttempts.current < maxReconnectAttempts) {
        console.log("👁️ Page visible, checking socket connection")
        connectSocket()
      }
    }

    document.addEventListener("visibilitychange", handleVisibilityChange)
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange)
  }, [connectSocket])

  return {
    isConnected,
    isRunning,
    settings,
    transcription,
    translation,
    connectionError,
    start,
    stop,
    updateSettings,
    moveOverlay,
    connect,
    disconnect,
  }
}
