import { NextResponse } from 'next/server'
import { dbConnect } from '@/lib/dbConnect'
import IncomeSource from '@/models/IncomeSource'

// ✅ GET all income sources
export async function GET(request) {
  try {
    await dbConnect()
    const { searchParams } = new URL(request.url)
    const query = {}

    if (searchParams.has('type')) query.type = searchParams.get('type')
    if (searchParams.has('isActive')) query.isActive = searchParams.get('isActive') === 'true'

    // Optional: Filter by month/year for dashboard
    if (searchParams.has('month') && searchParams.has('year')) {
      const month = parseInt(searchParams.get('month'))
      const year = parseInt(searchParams.get('year'))
      const startDate = new Date(year, month, 1)
      const endDate = new Date(year, month + 1, 0)
      query.createdAt = { $gte: startDate, $lte: endDate }
    }

    const incomeSources = await IncomeSource.find(query).sort({ createdAt: -1 })
    return NextResponse.json(incomeSources)
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// ✅ POST new income source (this part was missing)
export async function POST(request) {
  try {
    await dbConnect()
    const body = await request.json()
    const newIncome = await IncomeSource.create(body)
    return NextResponse.json(newIncome, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
