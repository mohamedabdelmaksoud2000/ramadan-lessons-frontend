"use client"

import { useEffect, useRef, useState } from "react"
import { Download, Moon, Pause, Play } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import { Slider } from "@/components/ui/slider"

const BASE_URL = "https://test.ysk-comics.com/"
// Define the lesson type
interface Lesson {
  id: number
  number: number
  name: string
  description: string
  audioUrl: string
}

export default function HomePage() {
  const [lessons, setLessons] = useState<Lesson[]>([])
  const [loading, setLoading] = useState(true)
  const [currentPlayingId, setCurrentPlayingId] = useState<number | null>(null)
  const [audioProgress, setAudioProgress] = useState<Record<number, number>>({})
  const [audioDuration, setAudioDuration] = useState<Record<number, number>>({})

  // Refs to store audio elements
  const audioRefs = useRef<Record<number, HTMLAudioElement>>({})

  // Fetch lessons from API
  useEffect(() => {
    const fetchLessons = async () => {
      try {
        // In a real app, replace with your actual API endpoint
        // Simulating API response for demonstration
        const response = await fetch(`https://ramadan.megatron-soft.com/api/lessons`, {
      headers: {
        "Accept": "application/json",
      },
    })

    const text = await response.text() // اجلب المحتوى كـ نص أولًا
    const data = JSON.parse(text) // حاول تحويل النص إلى JSON يدويًا

    const sortedLessons = data
      .map((lesson) => ({
        ...lesson,
        audioUrl: `${lesson.audioUrl}`, // إصلاح الرابط
      }))
      .sort((a, b) => a.number - b.number)

        setLessons(sortedLessons)
        setLoading(false)
      } catch (error) {
        console.error("Error fetching lessons:", error)
        setLoading(false)
      }
    }

    fetchLessons()
  }, [])

  // Initialize audio elements for each lesson
  useEffect(() => {
    if (!loading) {
      lessons.forEach((lesson) => {
        if (!audioRefs.current[lesson.id]) {
          const audio = new Audio()
          audio.src = lesson.audioUrl

          audio.onloadedmetadata = () => {
            setAudioDuration((prev) => ({
              ...prev,
              [lesson.id]: audio.duration || 0,
            }))
          }

          audio.ontimeupdate = () => {
            setAudioProgress((prev) => ({
              ...prev,
              [lesson.id]: audio.currentTime,
            }))
          }

          audio.onended = () => {
            setCurrentPlayingId(null)
          }

          audioRefs.current[lesson.id] = audio
        }
      })
    }

    // Cleanup function
    return () => {
      Object.values(audioRefs.current).forEach((audio) => {
        audio.pause()
        audio.src = ""
      })
    }
  }, [lessons, loading])

  const togglePlay = (lessonId: number) => {
    // If there's already a playing audio, pause it
    if (currentPlayingId !== null && currentPlayingId !== lessonId) {
      audioRefs.current[currentPlayingId]?.pause()
    }

    const audio = audioRefs.current[lessonId]
    if (!audio) return

    if (currentPlayingId === lessonId) {
      // Pause the current audio
      audio.pause()
      setCurrentPlayingId(null)
    } else {
      // Play the selected audio
      audio.play()
      setCurrentPlayingId(lessonId)
    }
  }

  const handleSliderChange = (lessonId: number, value: number[]) => {
    const audio = audioRefs.current[lessonId]
    if (audio) {
      audio.currentTime = value[0]
      setAudioProgress((prev) => ({
        ...prev,
        [lessonId]: value[0],
      }))
    }
  }

  // Format time in MM:SS
  const formatTime = (seconds: number) => {
    if (isNaN(seconds)) return "00:00"
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900" dir="rtl">
      {/* Header */}
      <header className="bg-white py-8 px-4 shadow-sm">
        <div className="container mx-auto flex flex-col items-center justify-center text-center">
          <div className="mb-4 relative w-16 h-16">
            <Moon className="w-16 h-16 text-amber-500" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-2 text-slate-800">دروس رمضان ١٤٤٦ هجري</h1>
          <h2 className="text-xl md:text-2xl mb-4 text-slate-600">Ramadan 2025 - ١٤٤٦ هجري</h2>
          <p className="text-lg text-slate-600 max-w-2xl">
            مجموعة من الدروس الإسلامية المميزة لشهر رمضان المبارك، استمع إليها مباشرة أو قم بتحميلها للاستماع لاحقاً
          </p>
        </div>
      </header>

      <Separator className="bg-slate-200" />

      {/* Main Content */}
      <main className="container mx-auto py-8 px-4">
        <h2 className="text-2xl font-bold mb-6 text-center text-slate-800">الدروس المتاحة</h2>

        {loading ? (
          // Loading skeletons
          <div className="grid grid-cols-1 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i} className="bg-white border-slate-200">
                <CardHeader>
                  <Skeleton className="h-6 w-3/4 bg-slate-200" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-4 w-full mb-2 bg-slate-200" />
                  <Skeleton className="h-4 w-5/6 bg-slate-200" />
                </CardContent>
                <CardFooter className="flex-col gap-4">
                  <Skeleton className="h-8 w-full bg-slate-200" />
                  <div className="flex gap-2 w-full">
                    <Skeleton className="h-10 w-24 bg-slate-200" />
                    <Skeleton className="h-10 w-24 bg-slate-200" />
                  </div>
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {lessons.map((lesson) => (
              <Card key={lesson.id} className="bg-white border-slate-200 overflow-hidden">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2 text-slate-800">
                    <span className="inline-flex items-center justify-center bg-amber-500 text-white w-8 h-8 rounded-full font-bold">
                      {lesson.number}
                    </span>
                    {lesson.name}
                  </CardTitle>
                </CardHeader>
                <CardContent className="pb-2">
                  <p className="text-slate-600">{lesson.description}</p>
                </CardContent>
                <CardFooter className="flex flex-col gap-4">
                  {/* Audio Player */}
                  <div className="w-full flex items-center gap-3 bg-slate-100 p-3 rounded-md">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 rounded-full bg-amber-500 text-white hover:bg-amber-600 hover:text-white"
                      onClick={() => togglePlay(lesson.id)}
                    >
                      {currentPlayingId === lesson.id ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                    </Button>

                    <div className="flex-1">
                      <Slider
                        value={[audioProgress[lesson.id] || 0]}
                        max={audioDuration[lesson.id] || 100}
                        step={0.1}
                        onValueChange={(value) => handleSliderChange(lesson.id, value)}
                        className="cursor-pointer"
                      />
                    </div>

                    <div className="text-xs text-slate-500 min-w-[70px] text-center">
                      {formatTime(audioProgress[lesson.id] || 0)} / {formatTime(audioDuration[lesson.id] || 0)}
                    </div>
                  </div>

                  {/* Download Button */}
                  <div className="self-end">
                    <Button variant="outline" className="border-slate-300 text-slate-700 hover:bg-slate-100">
                      <Download className="ml-2 h-4 w-4" />
                      تحميل الدرس
                    </Button>
                  </div>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="mt-auto py-6 bg-white border-t border-slate-200">
        <div className="container mx-auto px-4 text-center">
          <p className="text-slate-600">جميع الحقوق محفوظة © رمضان ١٤٤٦ هجري - ٢٠٢٥ ميلادي</p>
        </div>
      </footer>
    </div>
  )
}

