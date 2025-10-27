import { NextResponse } from 'next/server'
import { dbConnect } from '@/lib/dbConnect'
import Task from '@/models/Task'

// GET /api/tasks/[id] - Get specific task
export async function GET(request, { params }) {
  try {
    await dbConnect()
    const task = await Task.findById(params.id).populate('sourceId', 'name type')
    if (!task) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 })
    }
    return NextResponse.json(task)
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// PUT /api/tasks/[id] - Update task
export async function PUT(request, { params }) {
  try {
    await dbConnect()
    const body = await request.json()
    
    const task = await Task.findByIdAndUpdate(
      params.id,
      { $set: body },
      { new: true, runValidators: true }
    ).populate('sourceId', 'name type')
    
    if (!task) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 })
    }
    return NextResponse.json(task)
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// DELETE /api/tasks/[id] - Delete task
export async function DELETE(request, { params }) {
  try {
    await dbConnect()
    const task = await Task.findByIdAndDelete(params.id)
    if (!task) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 })
    }
    return NextResponse.json({ message: 'Task deleted successfully' })
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}