import type { ZodError } from "zod";

export function formatZodError(error: ZodError) {
  return error.issues.map((e) => e.message).join(", ");
}
