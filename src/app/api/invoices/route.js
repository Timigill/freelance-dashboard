import { NextResponse } from 'next/server'
import { dbConnect } from '@/lib/dbConnect'
import Invoice from '../../../models/invoices'

export async function GET() {
  await dbConnect()
  const invoices = await Invoice.find().sort({ createdAt: -1 })
  return NextResponse.json(invoices)
}

export async function POST(request) {
  await dbConnect()
  const body = await request.json()
  const invoice = await Invoice.create(body)
  return NextResponse.json(invoice)
}

export async function PUT(request) {
  await dbConnect()
  const { _id, ...rest } = await request.json()
  const updated = await Invoice.findByIdAndUpdate(_id, rest, { new: true })
  return NextResponse.json(updated)
}

export async function DELETE(request) {
  await dbConnect()
  const { id } = await request.json()
  await Invoice.findByIdAndDelete(id)
  return NextResponse.json({ success: true })
}
