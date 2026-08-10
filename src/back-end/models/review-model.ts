import { prisma } from "@/back-end/database/db";
import type { CreateReviewInput, UpdateReviewInput } from "@/back-end/types/review-types";

export class ReviewModel {
  /**
   * Create review + return stats in one transaction
   */
  async createWithStats(userId: string, data: CreateReviewInput) {
    return prisma.$transaction(async (tx) => {
      const review = await tx.review.create({
        data: {
          userId,
          productId: data.productId,
          rating: data.rating,
          comment: data.comment,
        },
        include: {
          user: {
            select: { id: true, name: true },
          },
        },
      });

      const stats = await tx.review.aggregate({
        where: { productId: data.productId },
        _avg: { rating: true },
        _count: { rating: true },
      });

      return {
        review,
        average: stats._avg.rating ? Number(stats._avg.rating.toFixed(1)) : 0,
        count: stats._count.rating,
      };
    });
  }

  async findByProductId(productId: string) {
    return prisma.review.findMany({
      where: { productId },
      orderBy: { createdAt: "desc" },
      include: {
        user: {
          select: { id: true, name: true },
        },
      },
    });
  }

  async findById(id: string) {
    return prisma.review.findUnique({
      where: { id },
      include: {
        user: {
          select: { id: true, name: true },
        },
        product: {
          select: { id: true, title: true },
        },
      },
    });
  }

  async findByUserAndProduct(userId: string, productId: string) {
    return prisma.review.findUnique({
      where: {
        productId_userId: { productId, userId },
      },
      include: {
        user: {
          select: { id: true, name: true },
        },
      },
    });
  }

  /**
   * Update review + stats in one transaction
   */
  async updateWithStats(id: string, productId: string, data: UpdateReviewInput) {
    return prisma.$transaction(async (tx) => {
      const review = await tx.review.update({
        where: { id },
        data: {
          rating: data.rating,
          comment: data.comment,
        },
        include: {
          user: {
            select: { id: true, name: true },
          },
        },
      });

      const stats = await tx.review.aggregate({
        where: { productId },
        _avg: { rating: true },
        _count: { rating: true },
      });

      return {
        review,
        average: stats._avg.rating ? Number(stats._avg.rating.toFixed(1)) : 0,
        count: stats._count.rating,
      };
    });
  }

  /**
   * Delete review + stats in one transaction
   */
  async deleteWithStats(id: string, productId: string) {
    return prisma.$transaction(async (tx) => {
      await tx.review.delete({
        where: { id },
      });

      const stats = await tx.review.aggregate({
        where: { productId },
        _avg: { rating: true },
        _count: { rating: true },
      });

      return {
        average: stats._avg.rating ? Number(stats._avg.rating.toFixed(1)) : 0,
        count: stats._count.rating,
      };
    });
  }

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
