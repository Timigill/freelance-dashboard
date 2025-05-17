import { dbConnect } from '@/lib/dbConnect'
import Client from '@/models/Client'

export async function GET() {
  await dbConnect()
  const clients = await Client.find().sort({ createdAt: -1 })
  return Response.json(clients)
}

export async function POST(request) {
  const body = await request.json()
  await dbConnect()
  const client = await Client.create(body)
  return Response.json(client)
}
