import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { cartService } from "@/back-end/services/cart-service";
import { authMiddleware } from "@/back-end/lib/auth-middleware/auth";
import {
  validateIdempotencyKey,
  claimIdempotencyKey,
  getIdempotentResponse,
  completeIdempotentResponse,
} from "@/back-end/lib/utils/helper";

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
        { status: 400 },
      );
    }

    // 1. Try to claim the key first (atomic)
    const claim = await claimIdempotencyKey({
      key: idempotencyKey,
      userId,
      method: "POST",
      path: "/api/cart/add",
    });

    // 2. If not claimed, another request owns it → wait for completed response
    if (!claim.claimed) {
      for (let i = 0; i < 10; i++) {
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

        // Still pending — short wait
        await new Promise((r) => setTimeout(r, 50));
      }

      return NextResponse.json(
        { success: false, message: "Request is still processing. Retry shortly." },
        { status: 409 },
      );
    }

    // 3. We own the key → safe to mutate cart once
    const body = await req.json();
    const result = await cartService.addToCart(userId, body);

    await completeIdempotentResponse({
      key: idempotencyKey,
      statusCode: result.status,
      response: result,
    });

    return NextResponse.json(result, { status: result.status });
  } catch (error) {
    console.error("[POST /api/cart/add]", error);
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}
