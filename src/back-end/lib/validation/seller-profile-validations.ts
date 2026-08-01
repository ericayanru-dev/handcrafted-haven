// src/back-end/schemas/seller-profile-schema.ts
import { z } from "zod";

/**
 * Base fields
 */
const sellerProfileBase = {
  storeName: z
    .string()
    .trim()
    .min(2, "Store name must be at least 2 characters")
    .max(100, "Store name is too long"),
  bio: z.string().trim().max(500, "Bio cannot exceed 500 characters").nullable().optional(),
};

/**
 * ======================
 * CREATE (POST)
 * ======================
 * userId normally comes from the authenticated user,
 * not from the request body.
 */
export const createSellerProfileSchema = z.object({
  storeName: sellerProfileBase.storeName,
  bio: sellerProfileBase.bio,
});

/**
 * ======================
 * UPDATE (PATCH)
 * ======================
 */
export const updateSellerProfileSchema = z
  .object({
    storeName: sellerProfileBase.storeName.optional(),
    bio: sellerProfileBase.bio,
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field must be provided for update",
  });

/**
 * ======================
 * PARAMS
 * ======================
 */
export const sellerProfileIdParamSchema = z.object({
  id: z.string().cuid("Invalid seller profile ID"),
});

export const sellerProfileUserIdParamSchema = z.object({
  userId: z.string().cuid("Invalid user ID"),
});

/**
 * ======================
 * QUERY (Get All)
 * ======================
 */
export const getAllSellerProfilesQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1).optional(),
  limit: z.coerce.number().int().min(1).max(50).default(10).optional(),
  search: z.string().trim().optional(),
});
