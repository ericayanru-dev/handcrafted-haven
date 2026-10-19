// src/app/api/orders/checkout/route.ts
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { orderService } from "@/back-end/services/order-service";
import { authMiddleware } from "@/back-end/lib/auth-middleware/auth";
import {
  validateIdempotencyKey,
  claimIdempotencyKey,
  getIdempotentResponse,
  completeIdempotentResponse,
} from "@/back-end/lib/utils/helper";

/**
 * POST /api/orders/checkout
 * Create order from current cart
 *
 * Requires header:
 *   Idempotency-Key: <unique-per-checkout-attempt>
 */
export async function POST(req: NextRequest) {
  try {
    const authResult = await authMiddleware(req);
    if (!authResult.success) return authResult.response;

    const userId = authResult.payload.userId;

    const rawKey = req.headers.get("Idempotency-Key");
    const idempotencyKey = validateIdempotencyKey(rawKey);

    if (!idempotencyKey) {
      return NextResponse.json(
        {
          success: false,
          message: "Valid Idempotency-Key header is required (8–128 chars)",
        },
        { status: 400 }
      );
    }

    // 1. Claim the key first (atomic)
    const claim = await claimIdempotencyKey({
      key: idempotencyKey,
      userId,
      method: "POST",
      path: "/api/orders/checkout",
    });

    // 2. Someone else already claimed this key → wait for their result
    if (!claim.claimed) {
      for (let i = 0; i < 15; i++) {
        const existing = await getIdempotentResponse(idempotencyKey, userId);

        if (existing?.conflict) {
          return NextResponse.json(
            { success: false, message: "Idempotency key conflict" },
            { status: 409 },
          );
        }

        if (existing && !existing.pending && existing.statusCode) {
          return NextResponse.json(existing.response, {
            status: existing.statusCode,
          });
        }

        // Still pending
        await new Promise((resolve) => setTimeout(resolve, 50));
      }

      return NextResponse.json(
        {
          success: false,
          message: "Checkout is still processing. Please retry shortly.",
        },
        { status: 409 }
      );
    }

    // 3. We own the key → create the order once
    const result = await orderService.checkout(userId);

    await completeIdempotentResponse({
      key: idempotencyKey,
      statusCode: result.status,
      response: result,
    });

    return NextResponse.json(result, { status: result.status });
  } catch (error) {
    console.error("[POST /api/orders/checkout]", error);
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}
