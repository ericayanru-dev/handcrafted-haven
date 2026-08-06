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
    const accessToken = request.cookies.get('accessToken')?.value;

    if (!accessToken) {
      return NextResponse.json(
        { success: false, error: 'Not authenticated', user: null },
        { status: 200 }
      );
    }

    const payload = await TokenService.verifyToken(accessToken);

    const user = await userRepo.findById(payload.userId);

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found', user: null },
        { status: 200 }
      );
    }

    return NextResponse.json({
      success: true,
      user
    });
  } catch (error) {
    console.error('Auth /me error:', error);
    return NextResponse.json(
      { success: false, error: 'Invalid or expired token', user: null },
      { status: 200 }
    );
  }
}
