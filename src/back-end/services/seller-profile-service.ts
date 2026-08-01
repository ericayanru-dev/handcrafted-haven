// src/back-end/services/seller-profile-service.ts
import { sellerProfileModel } from "@/back-end/models/seller-profile-model";
import {
  createSellerProfileSchema,
  updateSellerProfileSchema,
  sellerProfileIdParamSchema,
  sellerProfileUserIdParamSchema,
  getAllSellerProfilesQuerySchema,
} from "@/back-end/lib/validation/seller-profile-validations";
import type {
  SellerProfile,
  UpdateSellerProfileInput,
  SellerProfilesQuerySchema,
} from "@/back-end/types/seller-profile-types";
import { formatZodError } from "@/back-end/lib/utils/helper"; // adjust path if needed

export class SellerProfileService {
  /**
   * Get all seller profiles
   */
  async getAll(query: SellerProfilesQuerySchema) {
    try {
      const validation = getAllSellerProfilesQuerySchema.safeParse(query);
      if (!validation.success) {
        return {
          success: false,
          message: formatZodError(validation.error),
          status: 400,
        };
      }

      const profiles = await sellerProfileModel.findAll(validation.data);

      return {
        success: true,
        data: profiles,
        status: 200,
      };
    } catch (error) {
      console.error("[SellerProfileService.getAll]", error);
      return {
        success: false,
        message: "Failed to fetch seller profiles",
        status: 500,
      };
    }
  }

  /**
   * Get seller profile by User ID
   */
  async getByUserId(userId: string) {
    try {
      const validation = sellerProfileUserIdParamSchema.safeParse({ userId });
      if (!validation.success) {
        return {
          success: false,
          message: formatZodError(validation.error),
          status: 400,
        };
      }

      const profile = await sellerProfileModel.findByUserId(validation.data.userId);

      if (!profile) {
        return {
          success: false,
          message: "Seller profile not found",
          status: 404,
        };
      }

      return {
        success: true,
        data: profile,
        status: 200,
      };
    } catch (error) {
      console.error("[SellerProfileService.getByUserId]", error);
      return {
        success: false,
        message: "Failed to fetch seller profile",
        status: 500,
      };
    }
  }

  /**
   * Get seller profile by Profile ID
   */
  async getById(id: string) {
    try {
      const validation = sellerProfileIdParamSchema.safeParse({ id });
      if (!validation.success) {
        return {
          success: false,
          message: formatZodError(validation.error),
          status: 400,
        };
      }

      const profile = await sellerProfileModel.findById(validation.data.id);

      if (!profile) {
        return {
          success: false,
          message: "Seller profile not found",
          status: 404,
        };
      }

      return {
        success: true,
        data: profile,
        status: 200,
      };
    } catch (error) {
      console.error("[SellerProfileService.getById]", error);
      return {
        success: false,
        message: "Failed to fetch seller profile",
        status: 500,
      };
    }
  }

  /**
   * Create seller profile
   */
  async create(userId: string, body: SellerProfile) {
    try {
      const validation = createSellerProfileSchema.safeParse(body);
      if (!validation.success) {
        return {
          success: false,
          message: formatZodError(validation.error),
          status: 400,
        };
      }

      // Check if user already has a seller profile
      const existing = await sellerProfileModel.findByUserId(userId);
      if (existing) {
        return {
          success: false,
          message: "Seller profile already exists for this user",
          status: 409,
        };
      }

      const profile = await sellerProfileModel.create(userId, validation.data);

      return {
        success: true,
        data: profile,
        message: "Seller profile created successfully",
        status: 201,
      };
    } catch (error) {
      console.error("[SellerProfileService.create]", error);
      return {
        success: false,
        message: "Failed to create seller profile",
        status: 500,
      };
    }
  }

  /**
   * Update seller profile
   */
  async update(userId: string, body: UpdateSellerProfileInput) {
    try {
      const idValidation = sellerProfileUserIdParamSchema.safeParse({ userId });
      if (!idValidation.success) {
        return {
          success: false,
          message: formatZodError(idValidation.error),
          status: 400,
        };
      }

      const bodyValidation = updateSellerProfileSchema.safeParse(body);
      if (!bodyValidation.success) {
        return {
          success: false,
          message: formatZodError(bodyValidation.error),
          status: 400,
        };
      }

      const profile = await sellerProfileModel.findByUserId(idValidation.data.userId);

      if (!profile) {
        return {
          success: false,
          message: "Seller profile not found",
          status: 404,
        };
      }

      const updated = await sellerProfileModel.update(profile.id, bodyValidation.data);

      return {
        success: true,
        data: updated,
        message: "Seller profile updated successfully",
        status: 200,
      };
    } catch (error) {
      console.error("[SellerProfileService.update]", error);
      return {
        success: false,
        message: "Failed to update seller profile",
        status: 500,
      };
    }
  }

  /**
   * Delete seller profile
   */
  async delete(userId: string) {
    try {
      const validation = sellerProfileUserIdParamSchema.safeParse({ userId });
      if (!validation.success) {
        return {
          success: false,
          message: formatZodError(validation.error),
          status: 400,
        };
      }

      const profile = await sellerProfileModel.findByUserId(validation.data.userId);

      if (!profile) {
        return {
          success: false,
          message: "Seller profile not found",
          status: 404,
        };
      }

      // Authorization: only the owner can delete
      if (profile.userId !== userId) {
        return {
          success: false,
          message: "You are not authorized to delete this profile",
          status: 403,
        };
      }

      await sellerProfileModel.delete(profile.id);

      return {
        success: true,
        message: "Seller profile deleted successfully",
        status: 200,
      };
    } catch (error) {
      console.error("[SellerProfileService.delete]", error);
      return {
        success: false,
        message: "Failed to delete seller profile",
        status: 500,
      };
    }
  }
}

export const sellerProfileService = new SellerProfileService();
