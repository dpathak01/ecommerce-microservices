import { userRepository } from "../repositories/user.repository";
import { redis } from "../utils/redis";

function userCacheKey(authUserId: string) {
  return `user:${authUserId}`;
}

type UserProfileRecord = {
  id: string;
  authUserId: string;
  email: string;
  name: string;
  phone?: string | null;
  address?: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export const userService = {
  async create(input: { authUserId: string; email: string; name: string; phone?: string; address?: string }) {
    const user = await userRepository.create(input);
    await redis.set(userCacheKey(user.authUserId), JSON.stringify(user), "EX", 300);
    return user;
  },
  async update(authUserId: string, input: { name?: string; phone?: string; address?: string }) {
    const user = await userRepository.update(authUserId, input);
    await redis.del(userCacheKey(authUserId));
    return user;
  },
  async getByAuthUserId(authUserId: string) {
    const cached = await redis.get(userCacheKey(authUserId));
    if (cached) {
      return JSON.parse(cached);
    }

    const user = await userRepository.findByAuthUserId(authUserId);
    if (!user) {
      throw new Error("User not found");
    }

    await redis.set(userCacheKey(authUserId), JSON.stringify(user), "EX", 300);
    return user;
  },
  async getBulk(authUserIds: string[]) {
    const users = await userRepository.findByAuthUserIds(authUserIds) as unknown as UserProfileRecord[];
    await Promise.all(
      users.map((user: UserProfileRecord) => redis.set(userCacheKey(user.authUserId), JSON.stringify(user), "EX", 300))
    );
    return users;
  }
};
