import type { Mongoose } from "mongoose"
import type { DefaultSession } from "next-auth"

declare global {
  var mongoose: {
    conn: Mongoose | null
    promise: Promise<Mongoose> | null
  }
}

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      firstName: string
      lastName: string
    } & DefaultSession["user"]
  }

  interface User {
    id: string
    firstName: string
    lastName: string
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string
    firstName: string
    lastName: string
  }
}
