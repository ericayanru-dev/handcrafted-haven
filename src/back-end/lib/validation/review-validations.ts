import { z } from "zod";

export const createReviewSchema = z.object({
  productId: z.string().cuid("Invalid product ID"),
  rating: z.coerce
    .number()
    .int()
    .min(1, "Rating must be at least 1")
    .max(5, "Rating cannot be more than 5"),
  comment: z
    .string()
    .trim()
    .min(3, "Comment must be at least 3 characters")
    .max(1000, "Comment is too long"),
});

export const updateReviewSchema = z
  .object({
    rating: z.coerce
      .number()
      .int()
      .min(1, "Rating must be at least 1")
      .max(5, "Rating cannot be more than 5")
      .optional(),
    comment: z
      .string()
      .trim()
      .min(3, "Comment must be at least 3 characters")
      .max(1000, "Comment is too long")
      .optional(),
  })
  .refine((data) => data.rating !== undefined || data.comment !== undefined, {
    message: "At least one field must be provided",
  });

export const reviewIdParamSchema = z.object({
  id: z.string().cuid("Invalid review ID"),
});

export const productIdQuerySchema = z.object({
  productId: z.string().cuid("Invalid product ID"),
});
