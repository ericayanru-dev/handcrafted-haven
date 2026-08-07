import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { productService } from "@/back-end/services/product-services";
import { authMiddleware } from "@/back-end/lib/auth-middleware/auth";

/**
 * PATCH /api/products/[id]
 * Update a product (only the owner)
 */
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    const authResult = await authMiddleware(req);
    if (!authResult.success) {
      return authResult.response;
    }

    const { payload } = authResult;
    const body = await req.json();

    const result = await productService.update(id, payload.userId, body);

    return NextResponse.json(result, { status: result.status });
  } catch (error) {
    console.error("[PATCH /api/products/[id]]", error);
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}
