// src/app/api/auth/verify-email/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { authService } from '@/lib/services/auth-service';

export async function POST(request: NextRequest) {
  try {
    const { token } = await request.json();

    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Verification token is required.' },
        { status: 400 }
      );
    }

    const result = await authService.verifyEmail(token);

    return NextResponse.json(result, { 
      status: result.success ? 200 : 400 
    });
  } catch (error) {
    console.error('Verify Email API Error:', error);
    return NextResponse.json(
      { success: false, error: 'Invalid or expired verification link.' },
      { status: 400 }
    );
  }
}