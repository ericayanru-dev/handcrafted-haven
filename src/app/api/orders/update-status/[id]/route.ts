import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { orderService } from "@/back-end/services/order-service";
import { authMiddleware } from "@/back-end/lib/auth-middleware/auth";

/**
 * PATCH /api/orders/[id]/status
 * Body: { status: "PAID" | "FAILED" | ... }
 */
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    const authResult = await authMiddleware(req);
    if (!authResult.success) return authResult.response;

    const body = await req.json();
    const result = await orderService.updateStatus(id, body);

    return NextResponse.json(result, { status: result.status });
  } catch (error) {
    console.error("[PATCH /api/orders/[id]/status]", error);
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}
