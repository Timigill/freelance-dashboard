import mongoose from 'mongoose'

const MONGODB_URI = 'mongodb+srv://TimiGill:12321@clustermaintimi.mrzv7wd.mongodb.net/freelancedb?retryWrites=true&w=majority'

if (!MONGODB_URI) throw new Error('⚠️ MongoDB URI missing')

let cached = global.mongoose || { conn: null, promise: null }

export async function dbConnect() {
  if (cached.conn) return cached.conn
  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI, {
      bufferCommands: false,
    }).then(m => m)
  }
  cached.conn = await cached.promise
  return cached.conn
}
