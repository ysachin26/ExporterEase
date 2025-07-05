import { NextResponse } from 'next/server'
import { connectDB, getConnectionStatus } from '@/lib/db'
import User from '@/models/User'
import Dashboard from '@/models/Dashboard'

export async function GET() {
  try {
    const startTime = Date.now()
    
    // Test database connection
    await connectDB()
    
    // Get connection status
    const connectionStatus = getConnectionStatus()
    
    // Test database operations
    const userCount = await User.countDocuments()
    const dashboardCount = await Dashboard.countDocuments()
    
    // Test database query performance
    const queryStartTime = Date.now()
    const latestUser = await User.findOne().sort({ createdAt: -1 }).select('fullName createdAt')
    const queryEndTime = Date.now()
    
    const responseTime = Date.now() - startTime
    const queryTime = queryEndTime - queryStartTime
    
    return NextResponse.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      database: {
        connection: connectionStatus,
        responseTime: `${responseTime}ms`,
        queryTime: `${queryTime}ms`,
        collections: {
          users: userCount,
          dashboards: dashboardCount
        },
        latestUser: latestUser ? {
          name: latestUser.fullName,
          createdAt: latestUser.createdAt
        } : null
      },
      version: process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV || 'development'
    })
  } catch (error: any) {
    console.error('🚨 Health check failed:', error)
    
    return NextResponse.json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: {
        message: error.message,
        name: error.name,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      database: {
        connection: getConnectionStatus()
      }
    }, { status: 503 })
  }
}
