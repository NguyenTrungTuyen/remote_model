"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ChevronUp, ChevronDown, ChevronLeft, ChevronRight } from "lucide-react"

interface OverlayControlsProps {
  onMove: (direction: "up" | "down" | "left" | "right") => void
}

export default function OverlayControls({ onMove }: OverlayControlsProps) {
  return (
    <Card className="bg-white/80 backdrop-blur-sm border-purple-200">
      <CardHeader className="pb-2">
        <CardTitle className="text-base text-gray-800">Overlay Position</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onMove("left")}
            className="h-9 w-9 p-0 border-purple-300 hover:bg-purple-50"
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>

          <div className="flex flex-col gap-1">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onMove("up")}
              className="h-8 w-9 p-0 border-purple-300 hover:bg-purple-50"
            >
              <ChevronUp className="w-4 h-4" />
            </Button>
            <div className="w-6 h-6 bg-purple-200 rounded-full flex items-center justify-center mx-auto">
              <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onMove("down")}
              className="h-8 w-9 p-0 border-purple-300 hover:bg-purple-50"
            >
              <ChevronDown className="w-4 h-4" />
            </Button>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => onMove("right")}
            className="h-9 w-9 p-0 border-purple-300 hover:bg-purple-50"
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
