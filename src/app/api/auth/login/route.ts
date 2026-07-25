// src/app/api/auth/login/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { authService } from '@/back-end/services/auth-services';
import type { LoginRequest } from '@/back-end/types/auth-types';
import { AUTH_CONFIG } from '@/back-end/config/auth';   // ← Correct import

export async function POST(request: NextRequest) {
  try {
    const body: LoginRequest = await request.json();

    const result = await authService.login(body);

    if (result.success) {
      const response = NextResponse.json(result, { status: 200 });

      // Set HttpOnly cookies using config
      response.cookies.set('accessToken', result.token!, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: AUTH_CONFIG.JWT_ACCESS_EXPIRES_IN_SECONDS,
        path: '/',
      });

      response.cookies.set('refreshToken', result.refreshToken!, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: AUTH_CONFIG.JWT_REFRESH_EXPIRES_IN_SECONDS,
        path: '/',
      });

      return response;
    } else {
      return NextResponse.json(result, { status: 401 });
    }
  } catch (error) {
    console.error('Login API Error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}