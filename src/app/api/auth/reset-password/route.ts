// src/app/api/auth/reset-password/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { authService } from '@/lib/services/auth-service';
import type { ResetPasswordRequest } from '@/types/auth-types';

export async function POST(request: NextRequest) {
  try {
    const body: ResetPasswordRequest = await request.json();

    const result = await authService.resetPassword(body);

    return NextResponse.json(result, { 
      status: result.success ? 200 : 400 
    });
  } catch (error) {
    console.error('Reset Password API Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to reset password.' },
      { status: 500 }
    );
  }
}