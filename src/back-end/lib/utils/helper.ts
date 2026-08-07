import type { ZodError } from "zod";
import { del } from "@vercel/blob";

export function formatZodError(error: ZodError) {
  return error.issues.map((e) => e.message).join(", ");
}

/**
 * Delete a file from Vercel Blob.
 * Accepts a full blob URL or a pathname.
 */
export async function deleteBlobFile(urlOrPath?: string | null) {
  if (!urlOrPath) return;

  try {
    await del(urlOrPath);
  } catch (error) {
    // Don't crash the request if cleanup fails
    console.error("[deleteBlobFile]", error);
  }
}
