import type { JWTPayload } from "jose";

export type TokenType = "ACCESS" | "REFRESH" | "RESET" | "VERIFY";

export interface TokenPayload extends JWTPayload {
  userId: string;
  email: string;
  type: TokenType;
}

// Optional (clean internal type, no JWT fields)
export interface BaseTokenPayload {
  userId: string;
  email: string;
  type: TokenType;
}

export interface RefreshToken {
  id: string;
  userId: string;
  token: string;
  expiresAt: Date;
  revoked: boolean;
  createdAt: Date;
  user?: {
    id: string;
    name: string;
    email: string;
  };
}
