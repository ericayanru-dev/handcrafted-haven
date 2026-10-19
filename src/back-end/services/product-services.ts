import { productModel } from "@/back-end/models/product-model";
import { sellerProfileModel } from "@/back-end/models/seller-profile-model";
import {
  createProductSchema,
  updateProductSchema,
  productIdParamSchema,
  getAllProductsQuerySchema,
} from "@/back-end/lib/validation/product-validations";
import { formatZodError, deleteBlobFile } from "@/back-end/lib/utils/helper";

import type { ProductsQuerySchema, Product, UpdateProductInput } from "../types/product-types";
import type { Prisma } from "../database/generated/prisma/client";

export class ProductService {
  /**
   * Get all products
   */
  async getAll(query: ProductsQuerySchema) {
    try {
      const validation = getAllProductsQuerySchema.safeParse(query);

      if (!validation.success) {
        return {
          success: false,
          message: formatZodError(validation.error),
          status: 400,
        };
      }

      const products = await productModel.findAll(validation.data);

      return {
        success: true,
        data: products,
        status: 200,
      };
    } catch (error) {
      console.error("[ProductService.getAll]", error);
      return {
        success: false,
        message: "Failed to fetch products",
        status: 500,
      };
    }
  }

  /**
   * Get product by ID
   */
  async getById(id: string) {
    try {
      const validation = productIdParamSchema.safeParse({ id });

      if (!validation.success) {
        return {
          success: false,
          message: formatZodError(validation.error),
          status: 400,
        };
      }

      const product = await productModel.findById(validation.data.id);

      if (!product) {
        return {
          success: false,
          message: "Product not found",
          status: 404,
        };
      }

      return {
        success: true,
        data: product,
        status: 200,
      };
    } catch (error) {
      console.error("[ProductService.getById]", error);
      return {
        success: false,
        message: "Failed to fetch product",
        status: 500,
      };
    }
  }

  /**
   * Get products by Seller ID
   */
  async getBySellerId(sellerId: string) {
    try {
      if (!sellerId) {
        return {
          success: false,
          message: "Seller ID is required",
          status: 400,
        };
      }

      const products = await productModel.findBySellerId(sellerId);

      return {
        success: true,
        data: products,
        status: 200,
      };
    } catch (error) {
      console.error("[ProductService.getBySellerId]", error);
      return {
        success: false,
        message: "Failed to fetch seller products",
        status: 500,
      };
    }
  }

  async create(userId: string, body: Product, idempotencyKey: string) {
    try {
      if (!idempotencyKey || idempotencyKey.trim().length === 0) {
        return {
          success: false,
          message: "Idempotency-Key is required",
          status: 400,
        };
      }

      const validation = createProductSchema.safeParse(body);

      if (!validation.success) {
        return {
          success: false,
          message: formatZodError(validation.error),
          status: 400,
        };
      }

      const sellerProfile = await sellerProfileModel.findByUserId(userId);

      if (!sellerProfile) {
        return {
          success: false,
          message: "You must create a seller profile before adding products",
          status: 403,
        };
      }

      // Check whether this request was already processed.
      const existing = await productModel.findByIdempotencyKey(sellerProfile.id, idempotencyKey);

      if (existing) {
        return {
          success: true,
          data: existing,
          message: "Product already created",
          status: 200,
        };
      }

      const product = await productModel.create(sellerProfile.id, validation.data, idempotencyKey);

      return {
        success: true,
        data: product,
        message: "Product created successfully",
        status: 201,
      };
    } catch (error) {
      console.error("[ProductService.create]", error);

      const prismaError = error as Prisma.PrismaClientKnownRequestError;

      // Another simultaneous request may have created it first.
      if (prismaError.code === "P2002") {
        const sellerProfile = await sellerProfileModel.findByUserId(userId);

        if (sellerProfile) {
          const existing = await productModel.findByIdempotencyKey(
            sellerProfile.id,
            idempotencyKey
          );

          if (existing) {
            return {
              success: true,
              data: existing,
              message: "Product already created",
              status: 200,
            };
          }
        }

        return {
          success: false,
          message: "Duplicate request",
          status: 409,
        };
      }

      return {
        success: false,
        message: "Failed to create product",
        status: 500,
      };
    }
  }

  /**
   * Update product
   */
  async update(id: string, userId: string, body: UpdateProductInput) {
    try {
      const idValidation = productIdParamSchema.safeParse({ id });
      if (!idValidation.success) {
        return {
          success: false,
          message: formatZodError(idValidation.error),
          status: 400,
        };
      }

      const bodyValidation = updateProductSchema.safeParse(body);
      if (!bodyValidation.success) {
        return {
          success: false,
          message: formatZodError(bodyValidation.error),
          status: 400,
        };
      }

      const product = await productModel.findById(idValidation.data.id);

      if (!product) {
        return {
          success: false,
          message: "Product not found",
          status: 404,
        };
      }

      // Authorization: only the owner can update
      if (product.seller.userId !== userId) {
        return {
          success: false,
          message: "You are not authorized to update this product",
          status: 403,
        };
      }

      const updated = await productModel.update(idValidation.data.id, bodyValidation.data);
      // If image was replaced, delete the old one
      const newImageUrl = bodyValidation.data.imageUrl;
      const oldImageUrl = product.imageUrl;

      if (newImageUrl && oldImageUrl && newImageUrl !== oldImageUrl) {
        await deleteBlobFile(oldImageUrl);
      }

      return {
        success: true,
        data: updated,
        message: "Product updated successfully",
        status: 200,
      };
    } catch (error) {
      console.error("[ProductService.update]", error);
      return {
        success: false,
        message: "Failed to update product",
        status: 500,
      };
    }
  }

  /**
   * Delete product
   */
  async delete(id: string, userId: string) {
    try {
      const validation = productIdParamSchema.safeParse({ id });

      if (!validation.success) {
        return {
          success: false,
          message: formatZodError(validation.error),
          status: 400,
        };
      }

      const product = await productModel.findById(validation.data.id);

      if (!product) {
        return {
          success: false,
          message: "Product not found",
          status: 404,
        };
      }

      // Authorization: only the owner can delete
      if (product.seller.userId !== userId) {
        return {
          success: false,
          message: "You are not authorized to delete this product",
          status: 403,
        };
      }
      if (product.imageUrl) {
        await deleteBlobFile(product.imageUrl);
      }

      await productModel.delete(validation.data.id);

      return {
        success: true,
        message: "Product deleted successfully",
        status: 200,
      };
    } catch (error) {
      console.error("[ProductService.delete]", error);
      return {
        success: false,
        message: "Failed to delete product",
        status: 500,
      };
    }
  }
}

export const productService = new ProductService();
