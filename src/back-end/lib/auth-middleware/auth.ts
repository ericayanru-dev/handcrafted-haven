import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { TokenService } from "../utils/jwt";

export async function authMiddleware(req: NextRequest) {
  try {
    const accessToken = req.cookies.get("accessToken")?.value;

    if (!accessToken) {
      return {
        success: false as const,
        response: NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 }),
      };
    }

    const payload = await TokenService.verifyToken(accessToken);

    if (!payload || payload.type !== "ACCESS") {
      return {
        success: false as const,
        response: NextResponse.json({ success: false, message: "Access denied" }, { status: 401 }),
      };
    }

    return {
      success: true as const,
      payload,
    };
  } catch (error) {
    console.error("[authMiddleware]", error);
    return {
      success: false as const,
      response: NextResponse.json(
        { success: false, message: "Invalid or expired token" },
        { status: 401 },
      ),
    };
  }
}
