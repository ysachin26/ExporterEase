import mongoose from "mongoose"

const MONGODB_URI = process.env.MONGODB_URI

if (!MONGODB_URI) {
  throw new Error("Please define the MONGODB_URI environment variable inside .env.local")
}

// Enhanced connection configuration
interface ConnectionOptions {
  bufferCommands: boolean
  maxPoolSize: number
  serverSelectionTimeoutMS: number
  socketTimeoutMS: number
  family: number
  connectTimeoutMS: number
  maxIdleTimeMS: number
  retryWrites: boolean
  w: string
}

const cached = global as typeof global & {
  mongoose: { 
    conn: typeof mongoose | null
    promise: Promise<typeof mongoose> | null
    lastConnected?: Date
  }
}

if (!cached.mongoose) {
  cached.mongoose = { conn: null, promise: null }
}

// Connection monitoring
mongoose.connection.on('connected', () => {
  console.log('✅ MongoDB connected successfully')
  cached.mongoose.lastConnected = new Date()
})

mongoose.connection.on('error', (err) => {
  console.error('❌ MongoDB connection error:', err)
})

mongoose.connection.on('disconnected', () => {
  console.log('⚠️ MongoDB disconnected')
})

process.on('SIGINT', async () => {
  await mongoose.connection.close()
  console.log('🔌 MongoDB connection closed through app termination')
  process.exit(0)
})

export async function connectDB() {
  try {
    if (cached.mongoose.conn) {
      // Check if connection is still alive
      if (mongoose.connection.readyState === 1) {
        return cached.mongoose.conn
      }
    }

    if (!cached.mongoose.promise) {
      const opts: ConnectionOptions = {
        bufferCommands: false,
        maxPoolSize: 10, // Maximum number of connections in the connection pool
        serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
        socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
        family: 4, // Use IPv4, skip trying IPv6
        connectTimeoutMS: 10000, // Give up initial connection after 10 seconds
        maxIdleTimeMS: 30000, // Close connections after 30 seconds of inactivity
        retryWrites: true, // Retry failed writes
        w: 'majority', // Write concern
      }

      console.log('🔄 Connecting to MongoDB...')
      cached.mongoose.promise = mongoose.connect(MONGODB_URI!, opts).then((mongoose) => {
        console.log('✅ MongoDB connection established')
        return mongoose
      })
    }
    
    cached.mongoose.conn = await cached.mongoose.promise
    return cached.mongoose.conn
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error)
    cached.mongoose.promise = null // Reset promise to allow retry
    throw error
  }
}

// Health check function
export function getConnectionStatus() {
  return {
    readyState: mongoose.connection.readyState,
    host: mongoose.connection.host,
    port: mongoose.connection.port,
    name: mongoose.connection.name,
    lastConnected: cached.mongoose.lastConnected,
    states: {
      0: 'disconnected',
      1: 'connected',
      2: 'connecting',
      3: 'disconnecting'
    }[mongoose.connection.readyState]
  }
}

// Disconnect function for testing or maintenance
export async function disconnectDB() {
  try {
    await mongoose.connection.close()
    cached.mongoose.conn = null
    cached.mongoose.promise = null
    console.log('🔌 MongoDB disconnected manually')
  } catch (error) {
    console.error('❌ Error disconnecting from MongoDB:', error)
    throw error
  }
}
