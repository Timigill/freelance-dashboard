import { NextResponse } from 'next/server'
import {dbConnect} from '@/lib/dbConnect'
import Client from '@/models/Client'

export async function GET() {
  await dbConnect()
  const clients = await Client.find().sort({ createdAt: -1 })
  return NextResponse.json(clients)
}

export async function POST(request) {
  await dbConnect()
  const body = await request.json()
  const client = await Client.create(body)
  return NextResponse.json(client)
}
