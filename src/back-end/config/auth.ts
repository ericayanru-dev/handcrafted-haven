import "dotenv/config";

export const AUTH_CONFIG = {
  APP_NAME: "handcraft-haven",
  BASE_URL: process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000",
  RESEND_API_KEY: process.env.RESEND_API_KEY!,

  // JWT Settings (strings for jose library)
  JWT_SECRET: process.env.JWT_SECRET!,
  JWT_ACCESS_EXPIRES: "15m",
  JWT_REFRESH_EXPIRES: "7d",
  COOKIE_NAME: "auth_token",
  COOKIE_MAX_AGE: 7 * 24 * 60 * 60, // 7 days
  JWT_REFRESH_EXPIRES_IN_SECONDS: 7 * 24 * 60 * 60,
  JWT_ACCESS_EXPIRES_IN_SECONDS: 15 * 60,

  // Security
  BCRYPT_SALT_ROUNDS: 12,
  MAX_LOGIN_ATTEMPTS: 5,
} as const;

export type Config = typeof AUTH_CONFIG;