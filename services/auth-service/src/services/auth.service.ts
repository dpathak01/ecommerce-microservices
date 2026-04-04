import bcrypt from "bcryptjs";
import jwt, { SignOptions } from "jsonwebtoken";
import { authRepository } from "../repositories/auth.repository";
import { env } from "../config/env";

function buildTokens(user: { id: string; email: string; role: string }) {
  const accessTokenOptions: SignOptions = {
    subject: user.id,
    expiresIn: env.JWT_EXPIRES_IN as SignOptions["expiresIn"]
  };
  const refreshTokenOptions: SignOptions = {
    subject: user.id,
    expiresIn: env.JWT_REFRESH_EXPIRES_IN as SignOptions["expiresIn"]
  };

  const accessToken = jwt.sign(
    { email: user.email, role: user.role },
    env.JWT_SECRET,
    accessTokenOptions
  );

  const refreshToken = jwt.sign(
    { email: user.email, role: user.role, type: "refresh" },
    env.JWT_REFRESH_SECRET,
    refreshTokenOptions
  );

  return { accessToken, refreshToken };
}

export const authService = {
  async register(input: { email: string; password: string; name: string }) {
    const existingUser = await authRepository.findByEmail(input.email);
    if (existingUser) {
      throw new Error("User already exists");
    }

    const passwordHash = await bcrypt.hash(input.password, 12);
    const user = await authRepository.createUser({
      email: input.email,
      name: input.name,
      passwordHash
    });

    const tokens = buildTokens(user);
    await authRepository.createRefreshToken({
      token: tokens.refreshToken,
      userId: user.id,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    });

    return {
      ...tokens,
      userId: user.id,
      email: user.email
    };
  },
  async login(input: { email: string; password: string }) {
    const user = await authRepository.findByEmail(input.email);
    if (!user) {
      throw new Error("Invalid credentials");
    }

    const passwordMatches = await bcrypt.compare(input.password, user.passwordHash);
    if (!passwordMatches) {
      throw new Error("Invalid credentials");
    }

    const tokens = buildTokens(user);
    await authRepository.createRefreshToken({
      token: tokens.refreshToken,
      userId: user.id,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    });

    return {
      ...tokens,
      userId: user.id,
      email: user.email
    };
  },
  async refresh(refreshToken: string) {
    const payload = jwt.verify(refreshToken, env.JWT_REFRESH_SECRET) as { sub?: string };
    const tokenRecord = await authRepository.findRefreshToken(refreshToken);

    if (!payload.sub || !tokenRecord || tokenRecord.userId !== payload.sub) {
      throw new Error("Invalid refresh token");
    }

    const tokens = buildTokens(tokenRecord.user);

    await authRepository.deleteRefreshToken(refreshToken);
    await authRepository.createRefreshToken({
      token: tokens.refreshToken,
      userId: tokenRecord.user.id,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    });

    return {
      ...tokens,
      userId: tokenRecord.user.id,
      email: tokenRecord.user.email
    };
  },
  async validate(token: string) {
    const payload = jwt.verify(token, env.JWT_SECRET) as { sub: string; email: string; role: string };
    const user = await authRepository.findById(payload.sub);

    if (!user) {
      throw new Error("User not found");
    }

    return {
      userId: user.id,
      email: user.email,
      role: user.role
    };
  }
};
