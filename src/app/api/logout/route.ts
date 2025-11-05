import { NextResponse } from 'next/server';
import { authMiddleware, AuthenticatedRequest } from '@/middleware/authMiddleware';

async function handler(req: AuthenticatedRequest) {
  try {
    // Since we're using JWT, logout is handled client-side by removing the token
    // This endpoint can be used for logging or additional cleanup if needed
    
    return NextResponse.json(
      {
        success: true,
        message: 'Logout successful'
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export const POST = authMiddleware(handler);

