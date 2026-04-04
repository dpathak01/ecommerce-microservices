import { prisma } from "../utils/prisma";

export const userRepository = {
  create: (data: { authUserId: string; email: string; name: string; phone?: string; address?: string }) =>
    prisma.userProfile.create({ data }),
  update: (authUserId: string, data: { name?: string; phone?: string; address?: string }) =>
    prisma.userProfile.update({ where: { authUserId }, data }),
  findByAuthUserId: (authUserId: string) =>
    prisma.userProfile.findUnique({ where: { authUserId } }),
  findByAuthUserIds: (authUserIds: string[]) =>
    prisma.userProfile.findMany({ where: { authUserId: { in: authUserIds } } })
};

