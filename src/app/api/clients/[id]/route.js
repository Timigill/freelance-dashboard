import { NextResponse } from 'next/server'
import { dbConnect } from '@/lib/dbConnect'
import Client from '@/models/Client'

// ✅ DELETE client
export async function DELETE(req, { params }) {
  try {
    await dbConnect()
    const { id } = await params 
    await Client.findByIdAndDelete(id)
    return NextResponse.json({ message: 'Client deleted successfully' }, { status: 200 })
  } catch (err) {
    console.error('DELETE /api/clients/[id] error:', err)
    return NextResponse.json({ message: 'Failed to delete client' }, { status: 500 })
  }
}

// ✅ UPDATE client
export async function PUT(req, { params }) {
  try {
    await dbConnect()
    const { id } = await params
    const body = await req.json()
    const updatedClient = await Client.findByIdAndUpdate(id, body, { new: true })
    return NextResponse.json(updatedClient, { status: 200 })
  } catch (err) {
    console.error('PUT /api/clients/[id] error:', err)
    return NextResponse.json({ message: 'Failed to update client' }, { status: 500 })
  }
}
