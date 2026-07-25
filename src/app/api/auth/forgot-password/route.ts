// src/app/api/auth/forgot-password/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { authService } from '@/lib/services/auth-service';
import type { ForgotPasswordRequest } from '@/types/auth-types';

export async function POST(request: NextRequest) {
  try {
    const body: ForgotPasswordRequest = await request.json();

    const result = await authService.forgotPassword(body);
    
    return NextResponse.json({
      success: result.success,
      message: result.message || 'If an account exists with that email, a reset link has been sent.'
    });
    
  } catch (error) {
    console.error('Forgot Password API Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to process request.' },
      { status: 500 }
    );
  }
}