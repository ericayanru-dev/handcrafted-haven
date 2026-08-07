import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { sellerProfileService } from "@/back-end/services/seller-profile-service";

/**
 * GET /api/seller-profile/[id]
 */
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const result = await sellerProfileService.getById(id);

    return NextResponse.json(result, { status: result.status });
  } catch (error) {
    console.error("[GET /api/seller-profile/[id]]", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
