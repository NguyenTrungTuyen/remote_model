"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { X } from "lucide-react"
import { useCrosstalkSocket } from "../hooks/useCrosstalkSocket" // Import hook

interface SettingsModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const { settings, updateSettings } = useCrosstalkSocket() // Sử dụng hook

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-lg text-gray-800">Cài đặt</DialogTitle>
            <Button variant="ghost" size="sm" onClick={onClose} className="h-8 w-8 p-0">
              <X className="w-4 h-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Màn hình */}
          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-700">Màn hình hiển thị</Label>
            <Select
              value={settings.displayScreen}
              onValueChange={(value) => updateSettings({ displayScreen: value })}
            >
              <SelectTrigger className="h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="primary">Màn hình chính</SelectItem>
                <SelectItem value="secondary">Màn hình phụ</SelectItem>
                <SelectItem value="extended">Màn hình mở rộng</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Microphone */}
          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-700">Microphone</Label>
            <Select
              value={settings.microphone}
              onValueChange={(value) => updateSettings({ microphone: value })}
            >
              <SelectTrigger className="h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="default">Microphone mặc định</SelectItem>
                <SelectItem value="usb">Microphone USB</SelectItem>
                <SelectItem value="bluetooth">Tai nghe Bluetooth</SelectItem>
                <SelectItem value="internal">Microphone tích hợp</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Chế độ Overlay */}
          <div className="space-y-3">
            <Label className="text-sm font-medium text-gray-700">Chế độ Overlay</Label>
            <div className="space-y-2">
              {[
                { value: "subtitle", label: "Phụ đề Overlay" },
                { value: "fullscreen", label: "Toàn màn hình" },
                { value: "none", label: "Không Overlay" },
              ].map((option) => (
                <div key={option.value} className="flex items-center space-x-2">
                  <input
                    type="radio"
                    id={option.value}
                    name="overlayMode"
                    value={option.value}
                    checked={settings.overlayMode === option.value}
                    onChange={(e) => updateSettings({ overlayMode: e.target.value })}
                    className="w-4 h-4 text-purple-600 border-gray-300 focus:ring-purple-500"
                  />
                  <Label htmlFor={option.value} className="text-sm text-gray-700">
                    {option.label}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          {/* Hiển thị Transcription và Translation */}
          <div className="space-y-3 pt-2 border-t">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium text-gray-700">Hiển thị Transcription</Label>
              <Switch
                checked={settings.showTranscription}
                onCheckedChange={(checked) => updateSettings({ showTranscription: checked })}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium text-gray-700">Hiển thị Translation</Label>
              <Switch
                checked={settings.showTranslation}
                onCheckedChange={(checked) => updateSettings({ showTranslation: checked })}
              />
            </div>
          </div>

          <div className="pt-4">
            <Button
              onClick={onClose}
              className="w-full bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white"
            >
              Lưu cài đặt
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}