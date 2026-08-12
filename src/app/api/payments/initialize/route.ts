import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { authMiddleware } from "@/back-end/lib/auth-middleware/auth";
import { paymentService } from "@/back-end/services/payment-service";
import { validateIdempotencyKey } from "@/back-end/lib/utils/helper";

/**
 * POST /api/payments/initialize
 * Headers: Idempotency-Key
 * Body: { orderId, method: "CARD" | "PAYPAL" | "CASH_ON_DELIVERY" }
 */
export async function POST(req: NextRequest) {
  try {
    const authResult = await authMiddleware(req);
    if (!authResult.success) return authResult.response;

    const rawKey = req.headers.get("Idempotency-Key");
    const idempotencyKey = validateIdempotencyKey(rawKey);

    if (!idempotencyKey) {
      return NextResponse.json(
        {
          success: false,
          message: "Valid Idempotency-Key header is required (8–128 chars)",
        },
        { status: 400 },
      );
    }

    const body = await req.json();
    const result = await paymentService.initialize(authResult.payload.userId, body, idempotencyKey);

    return NextResponse.json(result, { status: result.status });
  } catch (error) {
    console.error("[POST /api/payments/initialize]", error);
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}
