import { NextResponse } from 'next/server'
import { dbConnect } from '@/lib/dbConnect'
import Task from '@/models/Task'
import mongoose from 'mongoose'

// GET /api/tasks?sourceId=...&status=...&paymentStatus=...
export async function GET(request) {
  try {
    await dbConnect()
    const { searchParams } = new URL(request.url)
    const query = {}

    if (searchParams.has('sourceId')) query.sourceId = searchParams.get('sourceId')
    if (searchParams.has('status')) query.status = searchParams.get('status')
    if (searchParams.has('paymentStatus')) query.paymentStatus = searchParams.get('paymentStatus')

    const tasks = await Task.find(query)
      .populate('sourceId', 'name type')
      .sort({ dueDate: 1 })

    return NextResponse.json(tasks)
  } catch (error) {
    return NextResponse.json({ error: true, message: error.message }, { status: 500 })
  }
}

// POST /api/tasks
export async function POST(request) {
  try {
    await dbConnect()
    const body = await request.json()

    // Basic validation
    if (!body.name || !body.dueDate) {
      return NextResponse.json({ error: true, message: 'Task name and dueDate are required' }, { status: 400 })
    }

    const task = await Task.create(body)
    return NextResponse.json(task, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: true, message: error.message }, { status: 500 })
  }
}
