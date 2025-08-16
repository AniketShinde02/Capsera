import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const response = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
      message: 'CaptionCraft API is running'
    }

    return NextResponse.json(response, { status: 200 })

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    
    return NextResponse.json({
      status: 'error',
      error: errorMessage,
      timestamp: new Date().toISOString(),
      uptime: process.uptime()
    }, { status: 500 })
  }
}

// Health check for load balancers (simple ping)
export async function HEAD() {
  return new NextResponse(null, { status: 200 })
}
