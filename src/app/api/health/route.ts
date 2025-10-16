import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { config } from '@/lib/config';

export async function GET() {
  try {
    // Check database connection
    await connectDB();
    
    const healthCheck = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      version: config.get('app.version'),
      environment: config.get('app.environment'),
      services: {
        database: 'connected',
        paystack: config.get('paystack.publicKey') ? 'configured' : 'missing',
        cloudinary: config.get('cloudinary.cloudName') ? 'configured' : 'missing',
      },
    };

    return NextResponse.json(healthCheck);
  } catch (error) {
    console.error('Health check failed:', error);
    
    return NextResponse.json(
      {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: 'Service unavailable',
      },
      { status: 503 }
    );
  }
}