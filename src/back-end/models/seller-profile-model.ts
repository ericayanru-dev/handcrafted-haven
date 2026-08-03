// src/back-end/models/seller-profile-model.ts
import { prisma } from "@/back-end/database/db";
import type {
  UpdateSellerProfileInput,
  SellerProfile,
  SellerProfilesQuerySchema,
} from "@/back-end/types/seller-profile-types"; // or wherever your types are

export class SellerProfileModel {
  /**
   * Get all seller profiles
   */
  async findAll(query: SellerProfilesQuerySchema) {
    const { page = 1, limit = 10, search } = query;
    return await prisma.sellerProfile.findMany({
      skip: (page - 1) * limit,
      take: limit,
      where: search
        ? {
            OR: [
              { storeName: { contains: search, mode: "insensitive" } },
              { bio: { contains: search, mode: "insensitive" } },
              { user: { name: { contains: search, mode: "insensitive" } } },
              { location: { contains: search, mode: "insensitive" } },
            ],
          }
        : undefined,
      orderBy: { createdAt: "desc" },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            location: true,
          },
        },
        products: true,
      },
    });
  }

  /**
   * Get seller profile by User ID
   */
  async findByUserId(userId: string) {
    return await prisma.sellerProfile.findUnique({
      where: { userId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            location: true,
          },
        },
        products: true,
      },
    });
  }

  /**
   * Get seller profile by Profile ID
   */
  async findById(id: string) {
    return await prisma.sellerProfile.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            location: true,
          },
        },
        products: true,
      },
    });
  }

  /**
   * Create seller profile (POST)
   */
  async create(userId: string, data: SellerProfile) {
    return await prisma.sellerProfile.create({
      data: {
        userId,
        storeName: data.storeName,
        bio: data.bio,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            location: true,
          },
        },
      },
    });
  }

  /**
   * Update seller profile (PATCH)
   */
  async update(id: string, data: UpdateSellerProfileInput) {
    return await prisma.sellerProfile.update({
      where: { id },
      data: {
        storeName: data.storeName,
        bio: data.bio,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            location: true,
          },
        },
      },
    });
  }

  /**
   * Delete seller profile
   */
  async delete(id: string) {
    return await prisma.sellerProfile.delete({
      where: { id },
    });
  }
}

export const sellerProfileModel = new SellerProfileModel();
