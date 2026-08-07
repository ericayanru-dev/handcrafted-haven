import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { productService } from "@/back-end/services/product-services";
import { authMiddleware } from "@/back-end/lib/auth-middleware/auth";

/**
 * GET /api/products
 * Get all products (with pagination, search, filters)
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    type SortBy = "newest" | "price-asc" | "price-desc" | "title";

    const sortByParam = searchParams.get("sortBy");

    const query = {
      page: searchParams.get("page") ? parseInt(searchParams.get("page") as string, 10) : undefined,
      limit: searchParams.get("limit")
        ? parseInt(searchParams.get("limit") as string, 10)
        : undefined,
      search: searchParams.get("search") ?? undefined,
      category: searchParams.get("category") ?? undefined,
      minPrice: searchParams.get("minPrice")
        ? parseFloat(searchParams.get("minPrice") as string)
        : undefined,
      maxPrice: searchParams.get("maxPrice")
        ? parseFloat(searchParams.get("maxPrice") as string)
        : undefined,
      sellerId: searchParams.get("sellerId") ?? undefined,
      sortBy: (["newest", "price-asc", "price-desc", "title"] as SortBy[]).includes(
        sortByParam as SortBy
      )
        ? (sortByParam as SortBy)
        : undefined,
    };

    const result = await productService.getAll(query);

    return NextResponse.json(result, { status: result.status });
  } catch (error) {
    console.error("[GET /api/products]", error);
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}
