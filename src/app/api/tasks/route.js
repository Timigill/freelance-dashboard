import { NextResponse } from 'next/server'
import { dbConnect } from '@/lib/dbConnect'
import Task from '@/models/Task'
import mongoose from 'mongoose'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '../auth/[...nextauth]/route'

const castObjectId = (id) => (mongoose.Types.ObjectId.isValid(id) ? id : null)

const getUserIdFromSession = async () => {
  const session = await getServerSession(authOptions)
  if (!session) throw new Error('Unauthorized')
  return session.user.id
}

export async function GET(request) {
  try {
    await dbConnect()
    const userId = await getUserIdFromSession()
    const { searchParams } = new URL(request.url)
    const query = { userId }

    if (searchParams.has('sourceId')) {
      const id = castObjectId(searchParams.get('sourceId'))
      if (id) query.sourceId = id
    }
    if (searchParams.has('status')) query.status = searchParams.get('status')
    if (searchParams.has('paymentStatus')) query.paymentStatus = searchParams.get('paymentStatus')

    const tasks = await Task.find(query)
      .populate('sourceId', 'name type')
      .populate({ path: 'clientId', select: 'name email', strictPopulate: false })
      .sort({ dueDate: 1 })

    return NextResponse.json(tasks)
  } catch (err) {
    console.error('GET /api/tasks error:', err)
    return NextResponse.json({ error: true, message: err.message }, { status: 500 })
  }
}

export async function POST(request) {
  try {
    await dbConnect()
    const body = await request.json()
    const userId = await getUserIdFromSession()

    if (!body.name || !body.dueDate || !body.sourceId) {
      return NextResponse.json(
        { error: true, message: 'Task name, dueDate and sourceId are required' },
        { status: 400 }
      )
    }

    const task = await Task.create({ ...body, userId })

    // Populate separately
    await task.populate('sourceId', 'name type')
    if (task.clientId) await task.populate({ path: 'clientId', select: 'name email', strictPopulate: false })

    return NextResponse.json(task, { status: 201 })
  } catch (err) {
    console.error('POST /api/tasks error:', err)
    return NextResponse.json({ error: true, message: err.message }, { status: 500 })
  }
}
