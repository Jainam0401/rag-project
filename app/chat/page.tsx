"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { useState, useRef, useEffect } from "react"
import { useAuthStore } from "@/lib/store/authStore"

interface Message {
  id?: string
  role: "user" | "assistant"
  content: string
}

export default function ChatPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const countryCode = searchParams.get("country")
  const { user, logout } = useAuthStore()

  const countryMap: Record<string, { name: string; flag: string }> = {
    usa: { name: "United States", flag: "🇺🇸" },
    uk: { name: "United Kingdom", flag: "🇬🇧" },
    canada: { name: "Canada", flag: "🇨🇦" },
    australia: { name: "Australia", flag: "🇦🇺" },
  }

  const country = countryMap[countryCode || "usa"]

  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Initialize chat session
  useEffect(() => {
    const initializeSession = async () => {
      if (!user?.id) return

      try {
        const response = await fetch("/api/chat/history", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: user.id,
            country: countryCode || "usa",
          }),
        })

        const data = await response.json()
        if (data.session) {
          setSessionId(data.session.id)
          // Load chat history
          loadChatHistory(data.session.id)
        }
      } catch (err) {
        console.error("Session initialization error:", err)
        setError("Failed to initialize chat session")
      }
    }

    initializeSession()
  }, [user?.id, countryCode])

  // Load chat history
  const loadChatHistory = async (id: string) => {
    try {
      const response = await fetch(`/api/chat/history?sessionId=${id}`)
      const data = await response.json()
      if (data.messages) {
        setMessages(
          data.messages.map((msg: any) => ({
            id: msg.id,
            role: msg.role,
            content: msg.content,
          })),
        )
      }
    } catch (err) {
      console.error("Error loading history:", err)
    }
  }

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const handleLogout = () => {
    logout()
    router.push("/login")
  }

  const handleSend = async () => {
    if (!input.trim() || !sessionId || loading) return

    const userMessage: Message = { role: "user", content: input }
    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId,
          message: input,
          userId: user?.id,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to get response")
      }

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: data.message,
        },
      ])
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An error occurred"
      setError(errorMessage)
      setMessages((prev) => prev.slice(0, -1)) // Remove user message on error
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Navbar */}
      <nav className="bg-card border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <h1
              onClick={() => router.push("/dashboard")}
              className="text-xl font-bold text-foreground cursor-pointer hover:opacity-80 transition"
            >
              Study Abroad Assistant
            </h1>
            <div className="flex items-center gap-4">
              <span className="text-foreground text-sm">{user?.name}</span>
              <button onClick={handleLogout}  className="text-sm">
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Chat Header */}
      <div className="bg-card border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex items-center gap-3">
          <div className="text-4xl">{country.flag}</div>
          <div>
            <h2 className="text-2xl font-bold text-foreground">Study in {country.name}</h2>
            <p className="text-muted-foreground text-sm">Ask me anything about studying abroad.</p>
          </div>
        </div>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-8 py-8 bg-background">
        <div className="max-w-3xl mx-auto space-y-6">
          {messages.length === 0 && !loading && (
            <div className="text-center text-muted-foreground py-20">
              💬 Ask me anything about studying in {country.name}.
            </div>
          )}

          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
              <div
                className={`rounded-2xl px-5 py-3 max-w-[75%] ${
                  msg.role === "user"
                    ? "bg-primary text-primary-foreground rounded-br-none"
                    : "bg-card border shadow-sm text-foreground rounded-bl-none"
                }`}
              >
                {msg.content}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex justify-start">
              <div className="bg-card border shadow-sm rounded-2xl rounded-bl-none px-5 py-3 flex items-center gap-2">
               
                <span className="text-muted-foreground text-sm">Thinking...</span>
              </div>
            </div>
          )}

          {error && (
            <div className="bg-destructive/10 border border-destructive text-destructive rounded-lg px-4 py-3 text-sm">
              {error}
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area */}
      <div className="border-t bg-card px-4 sm:px-6 lg:px-8 py-4">
        <div className="max-w-3xl mx-auto flex items-center gap-3">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && !loading && handleSend()}
            placeholder={`Ask about ${country.name}...`}
            disabled={loading}
            className="flex-1 border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary bg-background text-foreground disabled:opacity-50"
          />
          <button onClick={handleSend} disabled={loading || !input.trim()} className="px-6">
            {loading ? "loading" : "Send"}
          </button>
        </div>
      </div>
    </div>
  )
}
