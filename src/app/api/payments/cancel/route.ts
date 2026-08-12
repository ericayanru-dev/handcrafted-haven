import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { authMiddleware } from "@/back-end/lib/auth-middleware/auth";
import { paymentService } from "@/back-end/services/payment-service";

/**
 * POST /api/payments/cancel
 * Body: { paymentId }
 */
export async function POST(req: NextRequest) {
  try {
    const authResult = await authMiddleware(req);
    if (!authResult.success) return authResult.response;

    const body = await req.json();
    const paymentId = body?.paymentId;

    if (!paymentId || typeof paymentId !== "string") {
      return NextResponse.json(
        { success: false, message: "paymentId is required" },
        { status: 400 }
      );
    }

    const result = await paymentService.cancelPayment(authResult.payload.userId, paymentId);

    return NextResponse.json(result, { status: result.status });
  } catch (error) {
    console.error("[POST /api/payments/cancel]", error);
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}
