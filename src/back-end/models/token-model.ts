// src/lib/repositories/token-repo.ts
import 'dotenv/config'; // ← Added

import { prisma } from '../database/db';
import { RefreshToken } from '../types/token-types';

export class TokenRepo {
  async createRefreshToken(userId: string, token: string, expiresAt: Date): Promise<RefreshToken> {
    return prisma.refreshToken.create({
      data: {
        userId,
        token,
        expiresAt,
        revoked: false,
      },
    });
  }

  async findRefreshToken(token: string): Promise<RefreshToken | null> {
    return prisma.refreshToken.findUnique({
      where: { token },
      include: { user: true },
    });
  }

  async revokeRefreshToken(token: string): Promise<void> {
    await prisma.refreshToken.update({
      where: { token },
      data: { revoked: true },
    });
  }
}

export const tokenRepo = new TokenRepo();
