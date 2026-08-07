import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { orderService } from "@/back-end/services/order-service";
import { authMiddleware } from "@/back-end/lib/auth-middleware/auth";

/**
 * GET /api/orders
 * Get logged-in user's order history
 */
export async function GET(req: NextRequest) {
  try {
    const authResult = await authMiddleware(req);
    if (!authResult.success) return authResult.response;

    const result = await orderService.getMyOrders(authResult.payload.userId);
    return NextResponse.json(result, { status: result.status });
  } catch (error) {
    console.error("[GET /api/orders]", error);
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}
