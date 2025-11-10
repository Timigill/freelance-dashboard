import { NextResponse } from 'next/server'
import { dbConnect } from '@/lib/dbConnect'
import Task from '@/models/Task'
import mongoose from 'mongoose'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../../auth/[...nextauth]/route'

const isValidId = (id) => mongoose.Types.ObjectId.isValid(id)

const getUserIdFromSession = async () => {
  const session = await getServerSession(authOptions)
  if (!session) throw new Error('Unauthorized')
  return session.user.id
}

export async function DELETE(req, context) {
  try {
    const { id } = await context.params
    if (!isValidId(id))
      return NextResponse.json({ error: true, message: 'Invalid Task ID' }, { status: 400 })

    await dbConnect()
    const userId = await getUserIdFromSession()

    const task = await Task.findOneAndDelete({ _id: id, userId })
    if (!task) return NextResponse.json({ error: true, message: 'Task not found' }, { status: 404 })

    return NextResponse.json({ message: 'Task deleted successfully' })
  } catch (err) {
    console.error('DELETE /api/tasks/[id] error:', err)
    return NextResponse.json({ error: true, message: err.message }, { status: err.message === 'Unauthorized' ? 401 : 500 })
  }
}

export async function PUT(req, context) {
  try {
    const { id } = await context.params
    if (!isValidId(id))
      return NextResponse.json({ error: true, message: 'Invalid Task ID' }, { status: 400 })

    await dbConnect()
    const userId = await getUserIdFromSession()
    const body = await req.json()

    const updated = await Task.findOneAndUpdate({ _id: id, userId }, body, { new: true })
      .populate('sourceId', 'name type')
      .populate({ path: 'clientId', select: 'name email', strictPopulate: false })

    if (!updated) return NextResponse.json({ error: true, message: 'Task not found' }, { status: 404 })

    return NextResponse.json(updated)
  } catch (err) {
    console.error('PUT /api/tasks/[id] error:', err)
    return NextResponse.json({ error: true, message: err.message }, { status: err.message === 'Unauthorized' ? 401 : 500 })
  }
}

