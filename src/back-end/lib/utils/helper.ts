import type { ZodError } from "zod";
import { del } from "@vercel/blob";
import { prisma } from "@/back-end/database/db";

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

const TTL_HOURS = 24;
const MAX_KEY_LENGTH = 128;

export function validateIdempotencyKey(key: string | null): string | null {
  if (!key) return null;
  const trimmed = key.trim();
  if (trimmed.length < 8 || trimmed.length > MAX_KEY_LENGTH) return null;
  return trimmed;
}

export async function claimIdempotencyKey(params: {
  key: string;
  userId: string;
  method: string;
  path: string;
}) {
  const expiresAt = new Date();
  expiresAt.setHours(expiresAt.getHours() + TTL_HOURS);

  try {
    await prisma.idempotencyKey.create({
      data: {
        key: params.key,
        userId: params.userId,
        method: params.method,
        path: params.path,
        statusCode: 0, // pending
        response: {}, // placeholder
        expiresAt,
      },
    });

    return { claimed: true as const };
  } catch (error: any) {
    // Unique constraint → someone else already claimed this key
    if (error?.code === "P2002") {
      return { claimed: false as const };
    }
    throw error;
  }
}

export async function getIdempotentResponse(key: string, userId: string) {
  const record = await prisma.idempotencyKey.findUnique({ where: { key } });

  if (!record) return null;

  if (record.userId !== userId) {
    return { conflict: true as const };
  }

  if (record.expiresAt < new Date()) {
    await prisma.idempotencyKey.delete({ where: { key } }).catch(() => {});
    return null;
  }

  // Still processing
  if (record.statusCode === 0) {
    return { pending: true as const };
  }

  return {
    conflict: false as const,
    pending: false as const,
    statusCode: record.statusCode,
    response: record.response,
  };
}

export async function completeIdempotentResponse(params: {
  key: string;
  statusCode: number;
  response: unknown;
}) {
  await prisma.idempotencyKey.update({
    where: { key: params.key },
    data: {
      statusCode: params.statusCode,
      response: params.response as any,
    },
  });
}
