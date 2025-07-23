"use client"

import { useState } from "react"
import Header from "@/components/Header"
import LanguageSelector from "@/components/LanguageSelector"
import SettingsModal from "@/components/SettingsModal"
import OverlayControls from "@/components/OverlayControls"
import TextDisplay from "@/components/TextDisplay"
import { useCrosstalkSocket } from "@/hooks/useCrosstalkSocket"

export default function RemoteControl() {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)

  const {
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
  } = useCrosstalkSocket()

  const handleLanguageChange = (from: string, to: string) => {
    updateSettings({
      fromLanguage: from,
      toLanguage: to,
    })
  }

  const handleSettingsChange = (newSettings: any) => {
    updateSettings({
      displayScreen: newSettings.displayScreen,
      microphone: newSettings.microphone,
      overlayMode: newSettings.overlayMode,
      showTranscription: newSettings.showTranscription,
      showTranslation: newSettings.showTranslation,
    })
  }

  const handleSettingsOpen = () => setIsSettingsOpen(true)
  const handleSettingsClose = () => setIsSettingsOpen(false)

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50">
      <div className="container mx-auto px-3 py-4 max-w-md">
        <div className="space-y-4">
          <Header
            isConnected={isConnected}
            isRunning={isRunning}
            connectionError={connectionError}
            onStart={start}
            onStop={stop}
            onSettingsOpen={handleSettingsOpen}
            onConnect={connect}
            onDisconnect={disconnect}
          />

          <LanguageSelector
            fromLanguage={settings.fromLanguage}
            toLanguage={settings.toLanguage}
            onChange={handleLanguageChange}
          />

          <SettingsModal
            isOpen={isSettingsOpen}
            onClose={handleSettingsClose}
            settings={settings}
            onChange={handleSettingsChange}
          />

          <OverlayControls onMove={moveOverlay} />

          <TextDisplay
            showTranscription={settings.showTranscription}
            showTranslation={settings.showTranslation}
            transcription={transcription}
            translation={translation}
          />
        </div>
      </div>
    </div>
  )
}
