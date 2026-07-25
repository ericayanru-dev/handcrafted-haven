// src/app/api/auth/resend-verification/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { authService } from '@/lib/services/auth-service';

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { success: false, error: 'Email is required' },
        { status: 400 }
      );
    }

    const result = await authService.resendVerification(email);

    if (result.success) {
      return NextResponse.json(result, { status: 200 });
    } else {
      return NextResponse.json(result, { status: 400 });
    }
  } catch (error) {
    console.error('Resend verification error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to resend verification email' },
      { status: 500 }
    );
  }
}