import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { sellerProfileService } from "@/back-end/services/seller-profile-service";
// import { getCurrentUser } from "@/back-end/lib/auth"; // your auth helper

/**
 * GET /api/seller-profile
 * Get all seller profiles (with pagination + search)
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    const query = {
      page: searchParams.get("page") ? parseInt(searchParams.get("page") as string) : undefined,
      limit: searchParams.get("limit") ? parseInt(searchParams.get("limit") as string) : undefined,
      search: searchParams.get("search") ?? undefined,
    };

    const result = await sellerProfileService.getAll(query);

    return NextResponse.json(result, { status: result.status });
  } catch (error) {
    console.error("[GET /api/seller-profile]", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
