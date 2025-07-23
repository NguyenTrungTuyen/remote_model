"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"

interface SettingsPanelProps {
  settings: {
    displayScreen: string
    microphone: string
    overlayMode: string
    showTranscription: boolean
    showTranslation: boolean
  }
  onChange: (settings: any) => void
}

export default function SettingsPanel({ settings, onChange }: SettingsPanelProps) {
  const updateSetting = (key: string, value: any) => {
    onChange({ ...settings, [key]: value })
  }

  return (
    <Card className="bg-white/80 backdrop-blur-sm border-purple-200">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg text-gray-800">Settings</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label className="text-sm font-medium text-gray-700">Display Screen</Label>
          <Select value={settings.displayScreen} onValueChange={(value) => updateSetting("displayScreen", value)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="primary">Primary Display</SelectItem>
              <SelectItem value="secondary">Secondary Display</SelectItem>
              <SelectItem value="extended">Extended Display</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label className="text-sm font-medium text-gray-700">Microphone</Label>
          <Select value={settings.microphone} onValueChange={(value) => updateSetting("microphone", value)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="default">Default Microphone</SelectItem>
              <SelectItem value="usb">USB Microphone</SelectItem>
              <SelectItem value="bluetooth">Bluetooth Headset</SelectItem>
              <SelectItem value="internal">Internal Microphone</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-3">
          <Label className="text-sm font-medium text-gray-700">Overlay Mode</Label>
          <div className="space-y-2">
            {[
              { value: "subtitle", label: "Subtitle Overlay" },
              { value: "fullscreen", label: "Full Screen" },
              { value: "none", label: "No Overlay" },
            ].map((option) => (
              <div key={option.value} className="flex items-center space-x-2">
                <input
                  type="radio"
                  id={option.value}
                  name="overlayMode"
                  value={option.value}
                  checked={settings.overlayMode === option.value}
                  onChange={(e) => updateSetting("overlayMode", e.target.value)}
                  className="w-4 h-4 text-purple-600 border-gray-300 focus:ring-purple-500"
                />
                <Label htmlFor={option.value} className="text-sm text-gray-700">
                  {option.label}
                </Label>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium text-gray-700">Show Transcription</Label>
            <Switch
              checked={settings.showTranscription}
              onCheckedChange={(checked) => updateSetting("showTranscription", checked)}
            />
          </div>
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium text-gray-700">Show Translation</Label>
            <Switch
              checked={settings.showTranslation}
              onCheckedChange={(checked) => updateSetting("showTranslation", checked)}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
