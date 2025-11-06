import { NextResponse } from 'next/server'
import { dbConnect } from '@/lib/dbConnect'
import Invoice from '@/models/Invoice'

export async function GET() {
  await dbConnect()
  const invoices = await Invoice.find().sort({ createdAt: -1 })
  return NextResponse.json(invoices)
}


export async function POST(req) {
  await dbConnect()
  const form = await req.json()

  if (!form.client || !form.amount || !form.status) {
    return NextResponse.json(
      { error: 'Please fill all required fields' },
      { status: 400 }
    )
  }

  try {
    // 🔹 Generate unique invoice ID
    const lastInvoice = await Invoice.findOne().sort({ createdAt: -1 })
    const lastIdNumber = lastInvoice
      ? parseInt(lastInvoice.id.split('-')[1])
      : 0
    const newId = `INV-${String(lastIdNumber + 1).padStart(3, '0')}`

    const newInvoice = await Invoice.create({
      ...form,
      id: newId, // use generated ID
    })

    return NextResponse.json(newInvoice, { status: 201 })
  } catch (err) {
    console.error('Error creating invoice:', err)

    // Handle duplicate key just in case
    if (err.code === 11000) {
      return NextResponse.json(
        { error: 'Invoice ID already exists. Try again.' },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}



export async function PUT(request) {
  try {
    await dbConnect()
    const data = await request.json()
    const { _id } = data
    if (!_id) return NextResponse.json({ error: 'Missing ID' }, { status: 400 })

    await Invoice.findByIdAndUpdate(_id, data, { new: true })
    const invoices = await Invoice.find().sort({ createdAt: -1 })
    return NextResponse.json(invoices)
  } catch (error) {
    console.error('PUT /api/invoices error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
