import { prisma } from "@/lib/prisma"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const sessionId = request.nextUrl.searchParams.get("sessionId")

    if (!sessionId) {
      return NextResponse.json({ error: "Session ID required" }, { status: 400 })
    }

    const messages = await prisma.message.findMany({
      where: { sessionId },
      orderBy: { createdAt: "asc" },
      select: {
        id: true,
        role: true,
        content: true,
        createdAt: true,
      },
    })

    return NextResponse.json({ messages })
  } catch (error) {
    console.error("History API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId, country } = await request.json()

    if (!userId || !country) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const session = await prisma.chatSession.create({
      data: {
        userId,
        country,
      },
    })

    return NextResponse.json({ session })
  } catch (error) {
    console.error("Session creation error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
