// src/app/api/auth/refresh/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { tokenRepo } from '@/lib/repositories/token-repo';
import { userService } from '@/lib/services/user-service';
import { JWT } from '@/lib/utils/jwt';

export async function POST(request: NextRequest) {
  try {
    const refreshToken = request.cookies.get('refreshToken')?.value;

    if (!refreshToken) {
      return NextResponse.json(
        { success: false, error: 'Session expired. Please login again.' },
        { status: 401 }
      );
    }

    const tokenRecord = await tokenRepo.findRefreshToken(refreshToken);

    if (!tokenRecord || tokenRecord.revoked) {
      return NextResponse.json(
        { success: false, error: 'Invalid session. Please login again.' },
        { status: 401 }
      );
    }

    if (new Date(tokenRecord.expiresAt) < new Date()) {
      await tokenRepo.revokeRefreshToken(refreshToken);
      return NextResponse.json(
        { success: false, error: 'Session expired. Please login again.' },
        { status: 401 }
      );
    }

    const user = await userService.findById(tokenRecord.userId);
    if (!user || user.status !== 'ACTIVE') {
      await tokenRepo.revokeRefreshToken(refreshToken);
      return NextResponse.json(
        { success: false, error: 'Account is inactive. Please contact support.' },
        { status: 401 }
      );
    }

    // Generate new tokens
    const newAccessToken = await JWT.signAccessToken({
      userId: user.id,
      email: user.email,
      role: user.role,
      type: 'ACCESS',
    });

    const newRefreshToken = await JWT.signRefreshToken({
      userId: user.id,
      email: user.email,
      role: user.role,
      type: 'REFRESH',
    });

    // Revoke old + save new refresh token
    await tokenRepo.revokeRefreshToken(refreshToken);
    await tokenRepo.createRefreshToken(
      user.id,
      newRefreshToken,
      new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    );

    const response = NextResponse.json({
      success: true,
      message: 'Tokens refreshed successfully.',
    });

    // Set new cookies
    response.cookies.set('accessToken', newAccessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 15 * 60,
      path: '/',
    });

    response.cookies.set('refreshToken', newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60,
      path: '/',
    });

    return response;

  } catch (error) {
    console.error('Refresh Token Error:', error);
    return NextResponse.json(
      { success: false, error: 'Session expired. Please login again.' },
      { status: 401 }
    );
  }
}