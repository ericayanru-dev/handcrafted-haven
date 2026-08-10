import { reviewModel } from "@/back-end/models/review-model";
import { productModel } from "@/back-end/models/product-model";
import {
  createReviewSchema,
  updateReviewSchema,
  reviewIdParamSchema,
  productIdQuerySchema,
} from "@/back-end/lib/validation/review-validations";
import { formatZodError } from "@/back-end/lib/utils/helper";
import { isDatabaseUnavailableError, databaseErrorResponse } from "@/back-end/lib/utils/db-error";

export class ReviewService {
  /**
   * Create review
   * - transaction for create + stats
   * - duplicate → return existing review (soft idempotency)
   */
  async create(userId: string, body: unknown) {
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

      // Already reviewed → return existing (safe retry)
      const existing = await reviewModel.findByUserAndProduct(userId, productId);
      if (existing) {
        const stats = await reviewModel.getAverageRating(productId);

        return {
          success: true,
          data: {
            review: existing,
            averageRating: stats.average,
            reviewCount: stats.count,
          },
          message: "Review already exists",
          status: 200, // not 201 — already created
        };
      }

      const result = await reviewModel.createWithStats(userId, {
        productId,
        rating,
        comment,
      });

      return {
        success: true,
        data: {
          review: result.review,
          averageRating: result.average,
          reviewCount: result.count,
        },
        message: "Review created successfully",
        status: 201,
      };
    } catch (error: any) {
      // Race: two creates at once
      if (error?.code === "P2002") {
        try {
          const productId = (body as any)?.productId;
          const existing = await reviewModel.findByUserAndProduct(userId, productId);
          const stats = await reviewModel.getAverageRating(productId);

          if (existing) {
            return {
              success: true,
              data: {
                review: existing,
                averageRating: stats.average,
                reviewCount: stats.count,
              },
              message: "Review already exists",
              status: 200,
            };
          }
        } catch {
          // fall through
        }

        return {
          success: false,
          message: "You have already reviewed this product",
          status: 409,
        };
      }

      console.error("[ReviewService.create]", error);

      if (isDatabaseUnavailableError(error)) {
        return databaseErrorResponse();
      }

      return {
        success: false,
        message: "Failed to create review",
        status: 500,
      };
    }
  }

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

      if (isDatabaseUnavailableError(error)) {
        return databaseErrorResponse();
      }

      return {
        success: false,
        message: "Failed to fetch reviews",
        status: 500,
      };
    }
  }

  async update(id: string, userId: string, body: unknown) {
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

      const result = await reviewModel.updateWithStats(
        idValidation.data.id,
        review.productId,
        bodyValidation.data,
      );

      return {
        success: true,
        data: {
          review: result.review,
          averageRating: result.average,
          reviewCount: result.count,
        },
        message: "Review updated successfully",
        status: 200,
      };
    } catch (error) {
      console.error("[ReviewService.update]", error);

      if (isDatabaseUnavailableError(error)) {
        return databaseErrorResponse();
      }

      return {
        success: false,
        message: "Failed to update review",
        status: 500,
      };
    }
  }

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

      const stats = await reviewModel.deleteWithStats(validation.data.id, review.productId);

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

      if (isDatabaseUnavailableError(error)) {
        return databaseErrorResponse();
      }

      return {
        success: false,
        message: "Failed to delete review",
        status: 500,
      };
    }
  }
}

export const reviewService = new ReviewService();
