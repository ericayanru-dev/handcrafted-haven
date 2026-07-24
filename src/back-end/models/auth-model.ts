// src/back-end/models/user-models.ts
import { prisma } from "@/back-end/database/db";
import type { SignupRequest, User, UserUpdateData } from "@/back-end/types/auth-types";

export class UserRepo {
  async findByEmail(email: string) {
    try {
      return await prisma.user.findUnique({
        where: { email: email.toLowerCase() },
        select: {
          id: true,
          name: true,
          email: true,
          password: true,
        },
      });
    } catch (error) {
      console.error("[UserRepo.findByEmail]", error);
      throw error;
    }
  }

  async findById(id: string) {
    try {
      return await prisma.user.findUnique({
        where: { id },
        select: {
          id: true,
          name: true,
          email: true,
          lastLoginAt: true,
          createdAt: true,
        },
      });
    } catch (error) {
      console.error("[UserRepo.findById]", error);
      throw error;
    }
  }

  async create(data: SignupRequest): Promise<User> {
    try {
      return await prisma.user.create({
        data: {
          name: data.name,
          email: data.email.toLowerCase(),
          password: data.password,
        },
      });
    } catch (error) {
      console.error("[UserRepo.create]", error);
      throw error;
    }
  }

  async getAll() {
    try {
      return await prisma.user.findMany({
        select: {
          id: true,
          name: true,
          email: true,
          emailVerified: true,
          lastLoginAt: true,
          createdAt: true,
        },
      });
    } catch (error) {
      console.error("[UserRepo.getAll]", error);
      throw error;
    }
  }

  async update(id: string, data: UserUpdateData) {
    try {
      return await prisma.user.update({
        where: { id },
        data,
        select: {
          id: true,
          name: true,
          email: true,
        },
      });
    } catch (error) {
      console.error("[UserRepo.update]", error);
      throw error;
    }
  }

  async delete(id: string) {
    try {
      return await prisma.user.delete({ where: { id } });
    } catch (error) {
      console.error("[UserRepo.delete]", error);
      throw error;
    }
  }

  async markEmailVerified(adminId: string): Promise<void> {
    try {
      await prisma.user.update({
        where: { id: adminId },
        data: {
          emailVerified: true,
          emailVerifiedAt: new Date(),
        },
      });
    } catch (error) {
      console.error("[UserRepo.markEmailVerified]", error);
      throw error;
    }
  }
}

export const userRepo = new UserRepo();