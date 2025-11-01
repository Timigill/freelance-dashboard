import mongoose from 'mongoose'

const MONGODB_URI =
  'mongodb+srv://TimiGill:12321@clustermaintimi.mrzv7wd.mongodb.net/freelancedb?retryWrites=true&w=majority'

if (!MONGODB_URI) throw new Error('⚠️ MongoDB URI missing')

// Ensure global cache across hot reloads (Next.js dev mode)
let cached = global._mongoose
if (!cached) {
  cached = global._mongoose = { conn: null, promise: null }
}

export async function dbConnect() {
  if (cached.conn) {
    // ✅ Already connected
    return cached.conn
  }

  if (!cached.promise) {
    // ✅ Create new connection promise (only once)
    cached.promise = mongoose
      .connect(MONGODB_URI, {
        bufferCommands: false,
      })
      .then((mongooseInstance) => {
        console.log('✅ MongoDB connected')
        return mongooseInstance
      })
      .catch((err) => {
        console.error('❌ MongoDB connection error:', err)
        throw err
      })
  }

  cached.conn = await cached.promise
  return cached.conn
}
