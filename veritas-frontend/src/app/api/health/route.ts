import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    return NextResponse.json({
      status: 'healthy',
      service: 'Veritas API',
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
      hedera: {
        network: process.env.HEDERA_NETWORK || 'testnet',
        account_configured: !!process.env.HEDERA_ACCOUNT_ID,
        topic_id: process.env.HEDERA_TOPIC_ID || 'not_configured'
      }
    });
  } catch (error: any) {
    return NextResponse.json({
      status: 'unhealthy',
      error: error.message,
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}