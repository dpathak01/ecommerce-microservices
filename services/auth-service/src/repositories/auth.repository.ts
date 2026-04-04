import { prisma } from "../utils/prisma";

export const authRepository = {
  createUser: (data: { email: string; name: string; passwordHash: string }) =>
    prisma.authUser.create({ data }),
  findByEmail: (email: string) =>
    prisma.authUser.findUnique({ where: { email } }),
  findById: (id: string) =>
    prisma.authUser.findUnique({ where: { id } }),
  createRefreshToken: (data: { token: string; userId: string; expiresAt: Date }) =>
    prisma.refreshToken.create({ data }),
  findRefreshToken: (token: string) =>
    prisma.refreshToken.findUnique({ where: { token }, include: { user: true } }),
  deleteRefreshToken: (token: string) =>
    prisma.refreshToken.deleteMany({ where: { token } })
};

