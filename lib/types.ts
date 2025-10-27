    export interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  createdAt: string
}

export interface ChatSession {
  id: string
  userId: string
  country: string
  createdAt: string
  updatedAt: string
}

export interface User {
  id: string
  email: string
  name: string
}
