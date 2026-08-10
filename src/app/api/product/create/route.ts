import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { productService } from "@/back-end/services/product-services";
import { authMiddleware } from "@/back-end/lib/auth-middleware/auth";

/**
 * POST /api/products
 * Create a new product (authenticated seller)
 */
export async function POST(req: NextRequest) {
  try {
    const authResult = await authMiddleware(req);

    if (!authResult.success) {
      return authResult.response;
    }

    const { payload } = authResult;

    const idempotencyKey = req.headers.get("Idempotency-Key");

    if (!idempotencyKey) {
      return NextResponse.json(
        {
          success: false,
          message: "Idempotency-Key header is required",
        },
        { status: 400 },
      );
    }

    const body = await req.json();

    const result = await productService.create(payload.userId, body, idempotencyKey);

    return NextResponse.json(result, {
      status: result.status,
    });
  } catch (error) {
    console.error("[POST /api/products]", error);

    return NextResponse.json(
      {
        success: false,
        message: "Internal server error",
      },
      { status: 500 },
    );
  }
}
