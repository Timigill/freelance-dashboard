import { NextResponse } from 'next/server'
import { dbConnect } from '@/lib/dbConnect'
import IncomeSource from '@/models/IncomeSource'

// ✅ GET /api/income/[id] - Get specific income source
export async function GET(request, { params }) {
  try {
    await dbConnect()
    const { id } = await params
    const incomeSource = await IncomeSource.findById(id)
    if (!incomeSource) {
      return NextResponse.json({ error: 'Income source not found' }, { status: 404 })
    }
    return NextResponse.json(incomeSource)
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// ✅ PUT /api/income/[id] - Update income source
export async function PUT(request, { params }) {
  try {
    await dbConnect()
    const { id } = await params 
    const body = await request.json()
    const incomeSource = await IncomeSource.findByIdAndUpdate(
      id,
      { $set: body },
      { new: true, runValidators: true }
    )
    if (!incomeSource) {
      return NextResponse.json({ error: 'Income source not found' }, { status: 404 })
    }
    return NextResponse.json(incomeSource)
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// ✅ DELETE /api/income/[id] - Delete income source
export async function DELETE(request, { params }) {
  try {
    await dbConnect()
    const { id } = await params 
    const incomeSource = await IncomeSource.findByIdAndDelete(id)
    if (!incomeSource) {
      return NextResponse.json({ error: 'Income source not found' }, { status: 404 })
    }
    return NextResponse.json({ message: 'Income source deleted successfully' })
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
