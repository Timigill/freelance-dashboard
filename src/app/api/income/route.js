import { NextResponse } from 'next/server'
import { dbConnect } from '@/lib/dbConnect'
import IncomeSource from '@/models/IncomeSource'

export async function GET(request) {
  try {
    await dbConnect()
    console.log('📡 GET /api/income hit')
    const incomeSources = await IncomeSource.find().sort({ createdAt: -1 })
    return NextResponse.json(incomeSources)
  } catch (error) {
    console.error('❌ API error in GET /api/income:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}


// ✅ POST new income source
export async function POST(request) {
  try {
    await dbConnect()
    const body = await request.json()

    // Validation guard (optional but helpful)
    if (!body.name || body.amount == null) {
      return NextResponse.json(
        { error: 'Name and amount are required.' },
        { status: 400 }
      )
    }

    const newIncome = await IncomeSource.create(body)
    return NextResponse.json(newIncome, { status: 201 })
  } catch (error) {
    console.error('POST /api/income error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}











