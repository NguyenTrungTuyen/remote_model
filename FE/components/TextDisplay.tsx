import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface TextDisplayProps {
  showTranscription: boolean
  showTranslation: boolean
  transcription?: string
  translation?: string
}

export default function TextDisplay({
  showTranscription,
  showTranslation,
  transcription = "",
  translation = "",
}: TextDisplayProps) {
  if (!showTranscription && !showTranslation) return null

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
      {showTranscription && (
        <Card className="bg-white/80 backdrop-blur-sm border-purple-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-800">Transcription</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="min-h-16 p-2 bg-gray-50 rounded-lg border text-sm">
              {transcription ? (
                <p className="text-gray-800">{transcription}</p>
              ) : (
                <p className="text-gray-500 italic">Original speech will appear here...</p>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {showTranslation && (
        <Card className="bg-white/80 backdrop-blur-sm border-purple-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-800">Translation</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="min-h-16 p-2 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg border text-sm">
              {translation ? (
                <p className="text-gray-800">{translation}</p>
              ) : (
                <p className="text-gray-500 italic">Translated text will appear here...</p>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
