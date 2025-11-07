import { NextResponse } from 'next/server'
import { dbConnect } from '@/lib/dbConnect'
import Task from '@/models/Task'
import mongoose from 'mongoose'

const isValidId = (id) => mongoose.Types.ObjectId.isValid(id)

export async function DELETE(req, context) {
  try {
    // params is a Promise in Next.js 16 App Router
    const params = await context.params  
    const { id } = params

    if (!isValidId(id)) {
      return NextResponse.json({ error: true, message: 'Invalid Task ID' }, { status: 400 })
    }

    await dbConnect()

    const task = await Task.findByIdAndDelete(id)
    if (!task) {
      return NextResponse.json({ error: true, message: 'Task not found' }, { status: 404 })
    }

    return NextResponse.json({ message: 'Task deleted successfully' })
  } catch (err) {
    return NextResponse.json({ error: true, message: err.message }, { status: 500 })
  }
}


