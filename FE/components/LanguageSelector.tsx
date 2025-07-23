"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowRightLeft } from "lucide-react"

interface LanguageSelectorProps {
  fromLanguage: string
  toLanguage: string
  onChange: (from: string, to: string) => void
}

const languages = [
  { code: "en", name: "English", flag: "🇺🇸" },
  { code: "vi", name: "Tiếng Việt", flag: "🇻🇳" },
  { code: "ja", name: "日本語", flag: "🇯🇵" },
  { code: "ko", name: "한국어", flag: "🇰🇷" },
  { code: "zh", name: "中文", flag: "🇨🇳" },
  { code: "fr", name: "Français", flag: "🇫🇷" },
  { code: "de", name: "Deutsch", flag: "🇩🇪" },
  { code: "es", name: "Español", flag: "🇪🇸" },
]

export default function LanguageSelector({ fromLanguage, toLanguage, onChange }: LanguageSelectorProps) {
  const handleFromChange = (value: string) => {
    onChange(value, toLanguage)
  }

  const handleToChange = (value: string) => {
    onChange(fromLanguage, value)
  }

  const swapLanguages = () => {
    onChange(toLanguage, fromLanguage)
  }

  return (
    <Card className="bg-white/80 backdrop-blur-sm border-purple-200">
      <CardHeader className="pb-2">
        <CardTitle className="text-base text-gray-800">Languages</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-5 gap-2 items-end">
          <div className="col-span-2 space-y-1">
            <label className="text-xs font-medium text-gray-700">From</label>
            <Select value={fromLanguage} onValueChange={handleFromChange}>
              <SelectTrigger className="h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {languages.map((lang) => (
                  <SelectItem key={lang.code} value={lang.code}>
                    <div className="flex items-center gap-2">
                      <span className="text-sm">{lang.flag}</span>
                      <span className="text-sm">{lang.name}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-center">
            <button
              onClick={swapLanguages}
              className="p-1.5 rounded-full bg-purple-100 hover:bg-purple-200 transition-colors"
            >
              <ArrowRightLeft className="w-3 h-3 text-purple-600" />
            </button>
          </div>

          <div className="col-span-2 space-y-1">
            <label className="text-xs font-medium text-gray-700">To</label>
            <Select value={toLanguage} onValueChange={handleToChange}>
              <SelectTrigger className="h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {languages.map((lang) => (
                  <SelectItem key={lang.code} value={lang.code}>
                    <div className="flex items-center gap-2">
                      <span className="text-sm">{lang.flag}</span>
                      <span className="text-sm">{lang.name}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
