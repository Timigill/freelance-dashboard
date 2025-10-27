import { NextResponse } from 'next/server'
import { dbConnect } from '@/lib/dbConnect'
import IncomeSource from '@/models/IncomeSource'

// GET /api/income - Get all income sources
export async function GET(request) {
  try {
    await dbConnect()
    const { searchParams } = new URL(request.url)
    
    // Build query based on filters
    const query = {}
    if (searchParams.has('type')) {
      query.type = searchParams.get('type')
    }
    if (searchParams.has('isActive')) {
      query.isActive = searchParams.get('isActive') === 'true'
    }

    const incomeSources = await IncomeSource.find(query).sort({ createdAt: -1 })
    return NextResponse.json(incomeSources)
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// POST /api/income - Create new income source
export async function POST(request) {
  try {
    await dbConnect()
    const body = await request.json()
    const incomeSource = await IncomeSource.create(body)
    return NextResponse.json(incomeSource, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}