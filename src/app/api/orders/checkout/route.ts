import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { orderService } from "@/back-end/services/order-service";
import { authMiddleware } from "@/back-end/lib/auth-middleware/auth";

/**
 * POST /api/orders/checkout
 * Create order from current cart
 */
export async function POST(req: NextRequest) {
  try {
    const authResult = await authMiddleware(req);
    if (!authResult.success) return authResult.response;

    const result = await orderService.checkout(authResult.payload.userId);
    return NextResponse.json(result, { status: result.status });
  } catch (error) {
    console.error("[POST /api/orders/checkout]", error);
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}
