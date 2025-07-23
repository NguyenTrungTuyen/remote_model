"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Play, Square, Wifi, WifiOff, Settings, AlertCircle, RefreshCw } from "lucide-react"

interface HeaderProps {
  isConnected: boolean
  isRunning: boolean
  connectionError: string | null
  onStart: () => void
  onStop: () => void
  onSettingsOpen: () => void
  onConnect?: () => void
  onDisconnect?: () => void
}

export default function Header({
  isConnected,
  isRunning,
  connectionError,
  onStart,
  onStop,
  onSettingsOpen,
  onConnect,
  onDisconnect,
}: HeaderProps) {
  return (
    <Card className="bg-white/80 backdrop-blur-sm border-purple-200">
      <CardContent className="p-3">
        <div className="flex items-center justify-between mb-3">
          <h1 className="text-lg font-bold text-gray-800">Crosstalk Remote</h1>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={onSettingsOpen}
              className="h-8 w-8 p-0 border-purple-300 hover:bg-purple-50 bg-transparent"
            >
              <Settings className="w-4 h-4" />
            </Button>
            <div className="flex items-center gap-2">
              {isConnected ? <Wifi className="w-4 h-4 text-green-500" /> : <WifiOff className="w-4 h-4 text-red-500" />}
              <span className={`text-xs font-medium ${isConnected ? "text-green-600" : "text-red-600"}`}>
                {isConnected ? "Connected" : "Disconnected"}
              </span>
            </div>
          </div>
        </div>

        {/* Connection Error Display */}
        {connectionError && (
          <div className="mb-3 p-2 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-yellow-600" />
              <span className="text-xs text-yellow-800">{connectionError}</span>
              {onConnect && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onConnect}
                  className="ml-auto h-6 px-2 text-xs border-yellow-300 hover:bg-yellow-100 bg-transparent"
                >
                  <RefreshCw className="w-3 h-3 mr-1" />
                  Retry
                </Button>
              )}
            </div>
          </div>
        )}

        <Button
          onClick={isRunning ? onStop : onStart}
          disabled={!isConnected}
          className={`w-full h-10 text-base font-semibold ${
            isRunning
              ? "bg-red-500 hover:bg-red-600 text-white"
              : "bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white"
          } ${!isConnected ? "opacity-50 cursor-not-allowed" : ""}`}
        >
          {isRunning ? (
            <>
              <Square className="w-4 h-4 mr-2" />
              Stop
            </>
          ) : (
            <>
              <Play className="w-4 h-4 mr-2" />
              Start
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  )
}
