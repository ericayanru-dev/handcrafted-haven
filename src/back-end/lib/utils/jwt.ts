// src/lib/services/token-service.ts

import { SignJWT, jwtVerify, CompactEncrypt, compactDecrypt, decodeJwt } from "jose";
import { randomUUID } from "crypto";

import type { TokenPayload } from "../../types/token-types";
import { AUTH_CONFIG } from "../../config/auth";

const SIGNING_KEY = new TextEncoder().encode(
  AUTH_CONFIG.JWT_SIGNING_SECRET ?? AUTH_CONFIG.JWT_SECRET
);

const ENCRYPTION_KEY = Buffer.from(
  AUTH_CONFIG.JWT_ENCRYPTION_SECRET ?? AUTH_CONFIG.JWT_SECRET,
  "base64"
);

if (ENCRYPTION_KEY.length !== 32) {
  console.warn("[TokenService] JWT_ENCRYPTION_SECRET should be exactly 32 bytes for A256GCM.");
}

const ISSUER = "Handcrafted-Haven";
const AUDIENCE = "Handcrafted-Haven";

/**
 * --------------------------------------------------------------------------
 * Token Service
 * --------------------------------------------------------------------------
 */

export class TokenService {
  private static async createNestedToken(
    payload: TokenPayload,
    expiresIn: string
  ): Promise<string> {
    /**
     * Step 1
     * Create Signed JWT (JWS)
     */

    const signedJwt = await new SignJWT(payload)
      .setProtectedHeader({
        alg: "HS256",
        typ: "JWT",
        kid: "v1",
      })
      .setIssuedAt()
      .setNotBefore("0s")
      .setIssuer(ISSUER)
      .setAudience(AUDIENCE)
      .setExpirationTime(expiresIn)
      .setJti(randomUUID())
      .sign(SIGNING_KEY);

    /**
     * Step 2
     * Encrypt the signed JWT
     */

    const jwe = await new CompactEncrypt(new TextEncoder().encode(signedJwt))
      .setProtectedHeader({
        alg: "dir",
        enc: "A256GCM",
        cty: "JWT",
        kid: "v1",
      })
      .encrypt(ENCRYPTION_KEY);

    return jwe;
  }

  /**
   * ------------------------------------------------------------------------
   * Access Token
   * ------------------------------------------------------------------------
   */

  static signAccessToken(payload: TokenPayload) {
    return this.createNestedToken(payload, AUTH_CONFIG.JWT_ACCESS_EXPIRES);
  }

  /**
   * ------------------------------------------------------------------------
   * Refresh Token
   * ------------------------------------------------------------------------
   */

  static signRefreshToken(payload: TokenPayload) {
    return this.createNestedToken(payload, AUTH_CONFIG.JWT_REFRESH_EXPIRES);
  }

  /**
   * ------------------------------------------------------------------------
   * Verify Token
   *
   * Decrypt JWE
   * Verify inner JWS
   * ------------------------------------------------------------------------
   */

  static async verifyToken(token: string): Promise<TokenPayload> {
    /**
     * Step 1
     * Decrypt JWE
     */

    const { plaintext } = await compactDecrypt(token, ENCRYPTION_KEY);

    /**
     * Step 2
     * Convert plaintext → Signed JWT
     */

    const signedJwt = new TextDecoder().decode(plaintext);

    /**
     * Step 3
     * Verify Signature
     */

    const { payload } = await jwtVerify(signedJwt, SIGNING_KEY, {
      issuer: ISSUER,
      audience: AUDIENCE,
    });

    return payload as TokenPayload;
  }

  /**
   * ------------------------------------------------------------------------
   * Verify Access Token
   * ------------------------------------------------------------------------
   */

  static async verifyAccessToken(token: string): Promise<TokenPayload> {
    const payload = await this.verifyToken(token);

    if (payload.type !== "ACCESS") {
      throw new Error("Invalid access token.");
    }

    return payload;
  }

  /**
   * ------------------------------------------------------------------------
   * Verify Refresh Token
   * ------------------------------------------------------------------------
   */

  static async verifyRefreshToken(token: string): Promise<TokenPayload> {
    const payload = await this.verifyToken(token);

    if (payload.type !== "REFRESH") {
      throw new Error("Invalid refresh token.");
    }

    return payload;
  }

  /**
   * ------------------------------------------------------------------------
   * Debug Helper
   *
   * This ONLY works on plain JWTs.
   * It will NOT work on encrypted Nested JWTs.
   * ------------------------------------------------------------------------
   */

  static decodeToken(token: string): TokenPayload | null {
    try {
      return decodeJwt(token) as TokenPayload;
    } catch {
      return null;
    }
  }

  /**
   * ------------------------------------------------------------------------
   * Debug Helper
   *
   * Decrypts the Nested JWT
   * Returns the decoded payload WITHOUT verifying.
   *
   * Debugging only.
   * ------------------------------------------------------------------------
   */

  static async decodeEncryptedToken(token: string): Promise<TokenPayload | null> {
    try {
      const { plaintext } = await compactDecrypt(token, ENCRYPTION_KEY);

      const signedJwt = new TextDecoder().decode(plaintext);

      return decodeJwt(signedJwt) as TokenPayload;
    } catch {
      return null;
    }
  }
}
