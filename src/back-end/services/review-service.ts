import { reviewModel } from "@/back-end/models/review-model";
import { productModel } from "@/back-end/models/product-model";
import {
  createReviewSchema,
  updateReviewSchema,
  reviewIdParamSchema,
  productIdQuerySchema,
} from "@/back-end/lib/validation/review-validations";
import { formatZodError } from "@/back-end/lib/utils/helper";
import type { CreateReviewInput, UpdateReviewInput } from "@/back-end/types/review-types";

export class ReviewService {
  /**
   * Create review
   */
  async create(userId: string, body: CreateReviewInput) {
    try {
      const validation = createReviewSchema.safeParse(body);
      if (!validation.success) {
        return {
          success: false,
          message: formatZodError(validation.error),
          status: 400,
        };
      }

      const { productId, rating, comment } = validation.data;

      const product = await productModel.findById(productId);
      if (!product) {
        return {
          success: false,
          message: "Product not found",
          status: 404,
        };
      }

      // Prevent duplicate review
      const existing = await reviewModel.findByUserAndProduct(userId, productId);
      if (existing) {
        return {
          success: false,
          message: "You have already reviewed this product",
          status: 409,
        };
      }

      const review = await reviewModel.create(userId, {
        productId,
        rating,
        comment,
      });

      const stats = await reviewModel.getAverageRating(productId);

      return {
        success: true,
        data: {
          review,
          averageRating: stats.average,
          reviewCount: stats.count,
        },
        message: "Review created successfully",
        status: 201,
      };
    } catch (error: any) {
      // Prisma unique constraint (race condition)
      if (error?.code === "P2002") {
        return {
          success: false,
          message: "You have already reviewed this product",
          status: 409,
        };
      }

      console.error("[ReviewService.create]", error);
      return {
        success: false,
        message: "Failed to create review",
        status: 500,
      };
    }
  }

  /**
   * Get reviews for a product
   */
  async getByProductId(productId: string) {
    try {
      const validation = productIdQuerySchema.safeParse({ productId });
      if (!validation.success) {
        return {
          success: false,
          message: formatZodError(validation.error),
          status: 400,
        };
      }

      const product = await productModel.findById(validation.data.productId);
      if (!product) {
        return {
          success: false,
          message: "Product not found",
          status: 404,
        };
      }

      const reviews = await reviewModel.findByProductId(validation.data.productId);
      const stats = await reviewModel.getAverageRating(validation.data.productId);

      return {
        success: true,
        data: {
          reviews,
          averageRating: stats.average,
          reviewCount: stats.count,
        },
        status: 200,
      };
    } catch (error) {
      console.error("[ReviewService.getByProductId]", error);
      return {
        success: false,
        message: "Failed to fetch reviews",
        status: 500,
      };
    }
  }

  /**
   * Update own review
   */
  async update(id: string, userId: string, body: UpdateReviewInput) {
    try {
      const idValidation = reviewIdParamSchema.safeParse({ id });
      if (!idValidation.success) {
        return {
          success: false,
          message: formatZodError(idValidation.error),
          status: 400,
        };
      }

      const bodyValidation = updateReviewSchema.safeParse(body);
      if (!bodyValidation.success) {
        return {
          success: false,
          message: formatZodError(bodyValidation.error),
          status: 400,
        };
      }

      const review = await reviewModel.findById(idValidation.data.id);
      if (!review) {
        return {
          success: false,
          message: "Review not found",
          status: 404,
        };
      }

      if (review.userId !== userId) {
        return {
          success: false,
          message: "You are not authorized to update this review",
          status: 403,
        };
      }

      const updated = await reviewModel.update(idValidation.data.id, bodyValidation.data);

      const stats = await reviewModel.getAverageRating(review.productId);

      return {
        success: true,
        data: {
          review: updated,
          averageRating: stats.average,
          reviewCount: stats.count,
        },
        message: "Review updated successfully",
        status: 200,
      };
    } catch (error) {
      console.error("[ReviewService.update]", error);
      return {
        success: false,
        message: "Failed to update review",
        status: 500,
      };
    }
  }

  /**
   * Delete own review
   */
  async delete(id: string, userId: string) {
    try {
      const validation = reviewIdParamSchema.safeParse({ id });
      if (!validation.success) {
        return {
          success: false,
          message: formatZodError(validation.error),
          status: 400,
        };
      }

      const review = await reviewModel.findById(validation.data.id);
      if (!review) {
        return {
          success: false,
          message: "Review not found",
          status: 404,
        };
      }

      if (review.userId !== userId) {
        return {
          success: false,
          message: "You are not authorized to delete this review",
          status: 403,
        };
      }

      const productId = review.productId;
      await reviewModel.delete(validation.data.id);

      const stats = await reviewModel.getAverageRating(productId);

      return {
        success: true,
        data: {
          averageRating: stats.average,
          reviewCount: stats.count,
        },
        message: "Review deleted successfully",
        status: 200,
      };
    } catch (error) {
      console.error("[ReviewService.delete]", error);
      return {
        success: false,
        message: "Failed to delete review",
        status: 500,
      };
    }
  }
}

export const reviewService = new ReviewService();
