import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { authMiddleware } from "@/back-end/lib/auth-middleware/auth";

// Allowed image types
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/jpg"];

// Max file size: 4MB
const MAX_SIZE = 4 * 1024 * 1024;

/**
 * POST /api/upload
 * Upload a product image to Vercel Blob
 */
export async function POST(req: NextRequest) {
  try {
    // 1. Authenticate
    const authResult = await authMiddleware(req);
    if (!authResult.success) {
      return authResult.response;
    }

    const { payload } = authResult;

    // 2. Get the file from FormData
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ success: false, message: "No file provided" }, { status: 400 });
    }

    // 3. Validate file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid file type. Only JPEG, PNG, and WebP are allowed.",
        },
        { status: 400 }
      );
    }

    // 4. Validate file size
    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        {
          success: false,
          message: "File is too large. Maximum size is 4MB.",
        },
        { status: 400 }
      );
    }

    // 5. Idempotency key (required for stable unique filename)
    const idempotencyKey = req.headers.get("Idempotency-Key");

    if (!idempotencyKey) {
      return NextResponse.json(
        {
          success: false,
          message: "Idempotency-Key header is required",
        },
        { status: 400 }
      );
    }

    // Basic format check
    if (idempotencyKey.length < 8 || idempotencyKey.length > 100) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid Idempotency-Key",
        },
        { status: 400 }
      );
    }

    const extension = file.name.split(".").pop()?.toLowerCase() || "jpg";
    const uniqueName = `products/${payload.userId}/${idempotencyKey}.${extension}`;

    // 6. Upload to Vercel Blob
    const blob = await put(uniqueName, file, {
      access: "public",
      addRandomSuffix: false,
    });

    // 7. Validate Blob response before using it
    if (
      !blob ||
      typeof blob.url !== "string" ||
      typeof blob.pathname !== "string" ||
      blob.url.trim() === "" ||
      blob.pathname.trim() === ""
    ) {
      console.error("[POST /api/upload] Invalid Blob response:", blob);

      return NextResponse.json(
        {
          success: false,
          message: "Image upload failed",
        },
        { status: 500 }
      );
    }

    // 8. Return the public URL
    return NextResponse.json(
      {
        success: true,
        data: {
          url: blob.url,
          pathname: blob.pathname,
        },
        message: "Image uploaded successfully",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("[POST /api/upload]", error);
    return NextResponse.json(
      { success: false, message: "Failed to upload image" },
      { status: 500 }
    );
  }
}
