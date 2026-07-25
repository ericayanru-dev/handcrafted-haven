// src/app/api/auth/me/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { TokenService } from '@/back-end/lib/utils/jwt';
import { userRepo } from '@/back-end/models/auth-model';

/**
 * GET /api/auth/me
 * Returns current logged-in user data
 * Used by Dashboard and other protected pages
 */
export async function GET(request: NextRequest) {
  try {
    // 1. Get access token from HttpOnly cookie
    const accessToken = request.cookies.get('accessToken')?.value;

    if (!accessToken) {
      return NextResponse.json(
        { success: false, error: 'Not authenticated' },
        { status: 401 }
      );
    }

    // 2. Verify the token
    const payload = await TokenService.verifyToken(accessToken);

    // 3. Fetch user from database
    const user = await userRepo.findById(payload.userId);

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    // 4. Check if account is active
    {/*if (user.status !== 'ACTIVE') {
      return NextResponse.json(
        { success: false, error: 'Account is inactive' },
        { status: 403 }
      );
    }*/}

    // 5. Return public user data
    return NextResponse.json({
      success: true,
      user
    })
  }
  catch (error) {
    console.error('Auth /me error:', error);
    return NextResponse.json(
      { success: false, error: 'Invalid or expired token' },
      { status: 401 }
    );
  }
}