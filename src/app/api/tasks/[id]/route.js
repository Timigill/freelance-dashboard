import { NextResponse } from 'next/server'
import { dbConnect } from '@/lib/dbConnect'
import Task from '@/models/Task'
import mongoose from 'mongoose'

// Helper: Validate ObjectId
const isValidId = (id) => mongoose.Types.ObjectId.isValid(id)

export async function GET(request, { params }) {
  try {
    await dbConnect()
    const { id } = params

    if (!isValidId(id)) {
      return NextResponse.json({ error: true, message: 'Invalid Task ID' }, { status: 400 })
    }

    const task = await Task.findById(id).populate('sourceId', 'name type')
    if (!task) {
      return NextResponse.json({ error: true, message: 'Task not found' }, { status: 404 })
    }
    return NextResponse.json(task)
  } catch (error) {
    return NextResponse.json({ error: true, message: error.message }, { status: 500 })
  }
}

export async function PUT(request, { params }) {
  try {
    await dbConnect()
    const { id } = params

    if (!isValidId(id)) {
      return NextResponse.json({ error: true, message: 'Invalid Task ID' }, { status: 400 })
    }

    const body = await request.json()
    const task = await Task.findByIdAndUpdate(id, { $set: body }, { new: true, runValidators: true })
      .populate('sourceId', 'name type')

    if (!task) {
      return NextResponse.json({ error: true, message: 'Task not found' }, { status: 404 })
    }
    return NextResponse.json(task)
  } catch (error) {
    return NextResponse.json({ error: true, message: error.message }, { status: 500 })
  }
}

export async function DELETE(request, { params }) {
  try {
    await dbConnect()
    const { id } = params

    if (!isValidId(id)) {
      return NextResponse.json({ error: true, message: 'Invalid Task ID' }, { status: 400 })
    }

    const task = await Task.findByIdAndDelete(id)
    if (!task) {
      return NextResponse.json({ error: true, message: 'Task not found' }, { status: 404 })
    }

    return NextResponse.json({ message: 'Task deleted successfully' })
  } catch (error) {
    return NextResponse.json({ error: true, message: error.message }, { status: 500 })
  }
}
