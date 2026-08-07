import bcrypt from "bcryptjs";
import { tokenRepo } from "../models/token-model";
import { TokenService } from "../lib/utils/jwt";
import { sendEmail } from "../lib/email/resend";
import { AUTH_CONFIG } from "../config/auth";
import { signupSchema, loginSchema } from "../lib/validation/auth-validations";
import { userRepo } from "../models/auth-model";
import { formatZodError } from "../lib/utils/helper";

import type { SignupRequest, LoginRequest } from "../types/auth-types";

export class AuthService {
  // ====================== SIGNUP ======================
  async signup(data: SignupRequest) {
    try {
      // Server-side validation
      const validation = signupSchema.safeParse(data);
      if (!validation.success) {
        return { success: false, error: formatZodError(validation.error), status: 400 };
      }

      // Check if user already exists
      const existingUser = await userRepo.findByEmail(validation.data.email);
      if (existingUser) {
        return { success: false, error: "User with this email already exists." };
      }

      // Hash password
      const password = await bcrypt.hash(validation.data.password, AUTH_CONFIG.BCRYPT_SALT_ROUNDS);

      // Create user
      const user = await userRepo.create({
        name: validation.data.name,
        email: validation.data.email.toLowerCase(),
        password,
      });

      // Generate verification token
      const verifyToken = await TokenService.signAccessToken({
        userId: user.id,
        email: user.email,
        type: "VERIFY",
      });

      const verifyUrl = `${AUTH_CONFIG.BASE_URL}/auth/verify-email?token=${verifyToken}`;

      // Send verification email
      await sendEmail(user.email, {
        type: "verification",
        props: {
          firstName: user.name.split(" ")[0] || user.name,
          verifyUrl,
        },
      });

      return {
        success: true,
        message: "Account created successfully. Please check your email to verify.",
      };
    } catch (error) {
      console.error("Signup error:", error);
      return { success: false, error: "Failed to create account. Please try again." };
    }
  }

  // ====================== LOGIN ======================
  async login(data: LoginRequest) {
    try {
      // Server-side validation
      const validation = loginSchema.safeParse(data);
      if (!validation.success) {
        return { success: false, error: formatZodError(validation.error), status: 400 };
      }

      const user = await userRepo.findByEmail(validation.data.email);
      if (!user) {
        return { success: false, error: "Invalid email or password." };
      }

      const Password = await bcrypt.compare(validation.data.password, user.password);
      if (!Password) {
        return { success: false, error: "Invalid email or password." };
      }

      {
        /*if (!user.emailVerified) {
        // Generate fresh verification token
        const verifyToken = await JWT.signAccessToken({
          userId: user.id,
          email: user.email,
          role: user.role,
          type: "VERIFY",
        });

        const verifyUrl = `${config.BASE_URL}/auth/verify-email?token=${verifyToken}`;

        // Resend verification email
        await sendEmail(user.email, {
          type: "verification",
          props: {
            firstName: user.name.split(" ")[0] || user.name,
            verifyUrl,
          },
        });

        return {
          success: false,
          error:
            "Please verify your email address first. We have sent a new verification link to your inbox.",
          user: userService.toPublicUser(user),
        };
      }*/
      }

      await userRepo.update(user.id, { lastLoginAt: new Date() }); // ====================== SEND LOGIN ALERT EMAIL ======================
      await sendEmail(user.email, {
        type: "login-alert",
        props: {
          firstName: user.name.split(" ")[0] || user.name,
          time: new Date().toLocaleString(),
          device: "New Device", // You can enhance this later with real device detection
          location: "Unknown Location", // You can enhance with IP geolocation later
          ipAddress: "Unknown IP", // You can enhance with real IP detection later
        },
      });

      const accessToken = await TokenService.signAccessToken({
        userId: user.id,
        name: user.name,
        email: user.email,
        type: "ACCESS",
      });

      const refreshToken = await TokenService.signRefreshToken({
        userId: user.id,
        email: user.email,
        type: "REFRESH",
      });

      await tokenRepo.createRefreshToken(
        user.id,
        refreshToken,
        new Date(Date.now() + AUTH_CONFIG.JWT_REFRESH_EXPIRES_IN_MS)
      );

      return {
        success: true,
        user: {
          email: user.email,
          id: user.id,
          name: user.name,
        },
        token: accessToken,
        refreshToken,
      };
    } catch (error) {
      console.error("Login error:", error);
      return { success: false, error: "Login failed. Please try again." };
    }
  }

  // ====================== VERIFY EMAIL ======================
  async verifyEmail(token: string) {
    try {
      const payload = await TokenService.verifyToken(token);
      if (payload.type !== "VERIFY") {
        return { success: false, error: "Invalid verification token." };
      }

      await userRepo.markEmailVerified(payload.userId);

      return {
        success: true,
        message: "Email verified successfully. You can now login.",
      };
    } catch (error) {
      console.error("Verify email error:", error);
      return { success: false, error: "Invalid or expired verification link." };
    }
  }
}
export const authService = new AuthService();
