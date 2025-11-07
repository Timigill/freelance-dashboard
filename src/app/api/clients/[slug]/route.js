import { NextResponse } from 'next/server'
import { dbConnect } from '@/lib/dbConnect'
import Client from '@/models/Client'

// ✅ GET single client by slug (id)
export async function GET(req, context) {
  try {
    await dbConnect()
    const { slug } = await context.params  // ✅ await params here

    const client = await Client.findById(slug)
    if (!client) {
      return NextResponse.json({ message: 'Client not found' }, { status: 404 })
    }

    return NextResponse.json(client)
  } catch (error) {
    console.error('GET /api/clients/[slug] error:', error)
    return NextResponse.json({ message: 'Server error' }, { status: 500 })
  }
}

// ✅ UPDATE client
export async function PUT(req, context) {
  try {
    await dbConnect()
    const { slug } = await context.params  // ✅ same fix here
    const body = await req.json()

    const updatedClient = await Client.findByIdAndUpdate(slug, body, { new: true })
    if (!updatedClient) {
      return NextResponse.json({ message: 'Client not found' }, { status: 404 })
    }

    return NextResponse.json(updatedClient)
  } catch (error) {
    console.error('PUT /api/clients/[slug] error:', error)
    return NextResponse.json({ message: 'Failed to update client' }, { status: 500 })
  }
}

// ✅ DELETE client
export async function DELETE(req, context) {
  try {
    await dbConnect()
    const { slug } = await context.params  // ✅ and here too
    await Client.findByIdAndDelete(slug)

    return NextResponse.json({ message: 'Client deleted successfully' }, { status: 200 })
  } catch (error) {
    console.error('DELETE /api/clients/[slug] error:', error)
    return NextResponse.json({ message: 'Failed to delete client' }, { status: 500 })
  }
}
