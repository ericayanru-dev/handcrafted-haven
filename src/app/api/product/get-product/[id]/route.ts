import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { productService } from "@/back-end/services/product-services";

/**
 * GET /api/products/[id]
 * Get a single product by ID
 */
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    const result = await productService.getById(id);

    return NextResponse.json(result, { status: result.status });
  } catch (error) {
    console.error("[GET /api/products/[id]]", error);
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}
