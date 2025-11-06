import { NextResponse } from 'next/server'
import { dbConnect } from '@/lib/dbConnect'
import Invoice from '@/models/Invoice'

export async function DELETE(_, context) {
  await dbConnect()
  const { id } = await context.params
  await Invoice.findByIdAndDelete(id)
  const invoices = await Invoice.find().sort({ createdAt: -1 })
  return NextResponse.json(invoices)
}
