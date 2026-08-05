import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { cartService } from "@/back-end/services/cart-service";
import { authMiddleware } from "@/back-end/lib/auth-middleware/auth";

/**
 * DELETE /api/cart/remove
 * Body: { productId }
 */
export async function DELETE(req: NextRequest) {
  try {
    const authResult = await authMiddleware(req);
    if (!authResult.success) return authResult.response;

    const body = await req.json();
    const result = await cartService.removeItem(authResult.payload.userId, body);

    return NextResponse.json(result, { status: result.status });
  } catch (error) {
    console.error("[DELETE /api/cart/remove]", error);
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}
