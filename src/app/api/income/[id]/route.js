// import { NextResponse } from 'next/server'
// import { dbConnect } from '@/lib/dbConnect'
// import IncomeSource from '@/models/IncomeSource'
// import jwt from 'jsonwebtoken'

// const getUserIdFromReq = (req) => {
//   const token = req.cookies.get('token')?.value
//   if (!token) throw new Error('Unauthorized')
//   const decoded = jwt.verify(token, process.env.JWT_SECRET)
//   return decoded.id
// }

// export async function GET(request, { params }) {
//   try {
//     await dbConnect()
//     const userId = getUserIdFromReq(request)
//     const { id } = params
//     const incomeSource = await IncomeSource.findOne({ _id: id, userId })
//     if (!incomeSource) return NextResponse.json({ error: 'Income source not found' }, { status: 404 })
//     return NextResponse.json(incomeSource)
//   } catch (error) {
//     return NextResponse.json({ error: error.message }, { status: 500 })
//   }
// }

// export async function PUT(request, { params }) {
//   try {
//     await dbConnect()
//     const userId = getUserIdFromReq(request)
//     const { id } = params
//     const body = await request.json()
//     const incomeSource = await IncomeSource.findOneAndUpdate({ _id: id, userId }, { $set: body }, { new: true, runValidators: true })
//     if (!incomeSource) return NextResponse.json({ error: 'Income source not found' }, { status: 404 })
//     return NextResponse.json(incomeSource)
//   } catch (error) {
//     return NextResponse.json({ error: error.message }, { status: 500 })
//   }
// }

// export async function DELETE(request, { params }) {
//   try {
//     await dbConnect()
//     const userId = getUserIdFromReq(request)
//     const { id } = params
//     const incomeSource = await IncomeSource.findOneAndDelete({ _id: id, userId })
//     if (!incomeSource) return NextResponse.json({ error: 'Income source not found' }, { status: 404 })
//     return NextResponse.json({ message: 'Income source deleted successfully' })
//   } catch (error) {
//     return NextResponse.json({ error: error.message }, { status: 500 })
//   }
// }
