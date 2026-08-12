import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { authMiddleware } from "@/back-end/lib/auth-middleware/auth";
import { paymentService } from "@/back-end/services/payment-service";

/**
 * GET /api/payments/verify/paystack?reference=PAY-...
 */
export async function GET(req: NextRequest) {
  try {
    const authResult = await authMiddleware(req);
    if (!authResult.success) return authResult.response;

    const reference = req.nextUrl.searchParams.get("reference");

    const result = await paymentService.verifyPaystack(authResult.payload.userId, reference);

    return NextResponse.json(result, { status: result.status });
  } catch (error) {
    console.error("[GET /api/payments/verify/paystack]", error);
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}
