import { prisma } from "@/back-end/database/db";
import type { CreateReviewInput, UpdateReviewInput } from "@/back-end/types/review-types";

export class ReviewModel {
  async create(userId: string, data: CreateReviewInput) {
    return prisma.review.create({
      data: {
        userId,
        productId: data.productId,
        rating: data.rating,
        comment: data.comment,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
  }

  async findByProductId(productId: string) {
    return prisma.review.findMany({
      where: { productId },
      orderBy: { createdAt: "desc" },
      include: {
        user: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
  }

  async findById(id: string) {
    return prisma.review.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
          },
        },
        product: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    });
  }

  async findByUserAndProduct(userId: string, productId: string) {
    return prisma.review.findUnique({
      where: {
        productId_userId: {
          productId,
          userId,
        },
      },
    });
  }

  async update(id: string, data: UpdateReviewInput) {
    return prisma.review.update({
      where: { id },
      data: {
        rating: data.rating,
        comment: data.comment,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
  }

  async delete(id: string) {
    return prisma.review.delete({
      where: { id },
    });
  }

  /**
   * Average rating for a product
   */
  async getAverageRating(productId: string) {
    const result = await prisma.review.aggregate({
      where: { productId },
      _avg: { rating: true },
      _count: { rating: true },
    });

    return {
      average: result._avg.rating ? Number(result._avg.rating.toFixed(1)) : 0,
      count: result._count.rating,
    };
  }
}

export const reviewModel = new ReviewModel();
