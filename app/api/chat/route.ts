import { prisma } from "@/lib/prisma"
import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { sessionId, message, userId } = await request.json()

    if (!sessionId || !message || !userId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    await prisma.message.create({
      data: {
        sessionId,
        role: "user",
        content: message,
      },
    })

    const fastApiUrl = process.env.FASTAPI_BACKEND_URL
    const aiResponse = await fetch(`${fastApiUrl}/ask`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        messages: [
          {
            role: "user",
            content: message,
          },
        ],
        latestQuestion: message,
      }),
    })

    if (!aiResponse.ok) {
      throw new Error(`FastAPI error: ${aiResponse.statusText}`)
    }

    const aiData = await aiResponse.json()
    const assistantMessage = aiData.answer || "Unable to process your request."

    await prisma.message.create({
      data: {
        sessionId,
        role: "assistant",
        content: assistantMessage,
      },
    })

    await prisma.chatSession.update({
      where: { id: sessionId },
      data: { updatedAt: new Date() },
    })

    return NextResponse.json({
      success: true,
      message: assistantMessage,
    })
  } catch (error) {
    console.error("Chat API error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 },
    )
  }
}
