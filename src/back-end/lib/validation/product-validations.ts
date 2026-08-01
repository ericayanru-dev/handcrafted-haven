import { z } from "zod";

/**
 * Base fields
 */
const productBase = {
  title: z
    .string()
    .trim()
    .min(2, "Title must be at least 2 characters")
    .max(150, "Title is too long"),
  description: z
    .string()
    .trim()
    .min(10, "Description must be at least 10 characters")
    .max(2000, "Description is too long"),
  price: z.coerce
    .number()
    .positive("Price must be greater than 0")
    .max(999999, "Price is too high"),
  stock: z.coerce
    .number()
    .int("Stock must be a whole number")
    .min(0, "Stock cannot be negative")
    .default(0),
  category: z.string().trim().min(2, "Category is required").max(50, "Category is too long"),
  imageUrl: z.string().url("Invalid image URL").optional().nullable(),
};

/**
 * CREATE (POST)
 */
export const createProductSchema = z.object({
  title: productBase.title,
  description: productBase.description,
  price: productBase.price,
  stock: productBase.stock,
  category: productBase.category,
  imageUrl: productBase.imageUrl,
});

/**
 * UPDATE (PATCH)
 */
export const updateProductSchema = z
  .object({
    title: productBase.title.optional(),
    description: productBase.description.optional(),
    price: productBase.price.optional(),
    stock: productBase.stock.optional(),
    category: productBase.category.optional(),
    imageUrl: productBase.imageUrl,
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field must be provided for update",
  });

/**
 * PARAMS
 */
export const productIdParamSchema = z.object({
  id: z.string().cuid("Invalid product ID"),
});

/**
 * QUERY (Get All / Filter)
 */
export const getAllProductsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1).optional(),
  limit: z.coerce.number().int().min(1).max(50).default(12).optional(),
  search: z.string().trim().optional(),
  category: z.string().trim().optional(),
  minPrice: z.coerce.number().min(0).optional(),
  maxPrice: z.coerce.number().min(0).optional(),
  sellerId: z.string().cuid().optional(),
  sortBy: z.enum(["newest", "price-asc", "price-desc", "title"]).default("newest").optional(),
});
