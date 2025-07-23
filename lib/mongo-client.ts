import { MongoClient } from "mongodb"

const uri = process.env.MONGODB_URI!
if (!uri) throw new Error("Missing MONGODB_URI")

let globalClient: MongoClient

export async function getMongoClient() {
  if (!globalClient) {
    globalClient = new MongoClient(uri)
    await globalClient.connect()
  }
  return globalClient
}
