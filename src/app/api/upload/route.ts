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

    // 5. Generate a unique filename
    const extension = file.name.split(".").pop() || "jpg";
    const uniqueName = `products/${Date.now()}-${crypto.randomUUID()}.${extension}`;

    // 6. Upload to Vercel Blob
    const blob = await put(uniqueName, file, {
      access: "public",
      addRandomSuffix: false, // we already made it unique
    });

    // 7. Return the public URL
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
