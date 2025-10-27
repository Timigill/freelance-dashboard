import { NextResponse } from 'next/server'
import { dbConnect } from '@/lib/dbConnect'
import Task from '@/models/Task'

// GET /api/tasks - Get all tasks
export async function GET(request) {
  try {
    await dbConnect()
    const { searchParams } = new URL(request.url)
    
    // Build query based on filters
    const query = {}
    if (searchParams.has('sourceId')) {
      query.sourceId = searchParams.get('sourceId')
    }
    if (searchParams.has('status')) {
      query.status = searchParams.get('status')
    }
    if (searchParams.has('paymentStatus')) {
      query.paymentStatus = searchParams.get('paymentStatus')
    }

    const tasks = await Task.find(query)
      .populate('sourceId', 'name type') // Include basic source info
      .sort({ dueDate: 1 })
    
    return NextResponse.json(tasks)
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// POST /api/tasks - Create new task
export async function POST(request) {
  try {
    await dbConnect()
    const body = await request.json()
    const task = await Task.create(body)
    return NextResponse.json(task, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}