import { prisma } from "@/back-end/database/db";
import type { Product, ProductsQuerySchema, UpdateProductInput } from "../types/product-types";

export class ProductModel {
  /**
   * Get all products (with filters + pagination)
   */
  async findAll(query: ProductsQuerySchema) {
    const {
      page = 1,
      limit = 12,
      search,
      category,
      minPrice,
      maxPrice,
      sellerId,
      sortBy = "newest",
    } = query;

    const where: any = {};

    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ];
    }

    if (category) {
      where.category = { equals: category, mode: "insensitive" };
    }

    if (sellerId) {
      where.sellerId = sellerId;
    }

    if (minPrice !== undefined || maxPrice !== undefined) {
      where.price = {};
      if (minPrice !== undefined) where.price.gte = minPrice;
      if (maxPrice !== undefined) where.price.lte = maxPrice;
    }

    const orderBy =
      sortBy === "price-asc"
        ? { price: "asc" as const }
        : sortBy === "price-desc"
          ? { price: "desc" as const }
          : sortBy === "title"
            ? { title: "asc" as const }
            : { createdAt: "desc" as const };

    return prisma.product.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy,
      include: {
        seller: {
          select: {
            id: true,
            storeName: true,
            user: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        reviews: {
          select: {
            rating: true,
          },
        },
      },
    });
  }

  /**
   * Get product by ID
   */
  async findById(id: string) {
    return prisma.product.findUnique({
      where: { id },
      include: {
        seller: {
          select: {
            id: true,
            storeName: true,
            bio: true,
            rating: true,
            userId: true,
            user: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        reviews: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
              },
            },
          },
          orderBy: { createdAt: "desc" },
        },
      },
    });
  }

  /**
   * Get products by Seller Profile ID
   */
  async findBySellerId(sellerId: string) {
    return prisma.product.findMany({
      where: { sellerId },
      orderBy: { createdAt: "desc" },
      include: {
        reviews: {
          select: { rating: true },
        },
      },
    });
  }

  /**
   * Create product
   */
  async create(sellerId: string, data: Product) {
    return prisma.product.create({
      data: {
        sellerId,
        title: data.title,
        description: data.description,
        price: data.price,
        stock: data.stock ?? 0,
        category: data.category,
        imageUrl: data.imageUrl,
      },
      include: {
        seller: {
          select: {
            id: true,
            storeName: true,
          },
        },
      },
    });
  }

  /**
   * Update product
   */
  async update(id: string, data: UpdateProductInput) {
    return prisma.product.update({
      where: { id },
      data: {
        title: data.title,
        description: data.description,
        price: data.price,
        stock: data.stock,
        category: data.category,
        imageUrl: data.imageUrl,
      },
      include: {
        seller: {
          select: {
            id: true,
            storeName: true,
          },
        },
      },
    });
  }

  /**
   * Delete product
   */
  async delete(id: string) {
    return prisma.product.delete({
      where: { id },
    });
  }
}

export const productModel = new ProductModel();
