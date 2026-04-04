import jwt from "jsonwebtoken";
import { env } from "../config/env";

export type AuthContext = {
  userId?: string;
  email?: string;
  role?: string;
  token?: string;
};

type RequestWithHeaders = {
  headers: {
    authorization?: string | string[];
  };
};

export function getAuthContext(request: RequestWithHeaders): AuthContext {
  const header = request.headers.authorization;
  const authorization = Array.isArray(header) ? header[0] : header;

  if (!authorization?.startsWith("Bearer ")) {
    return {};
  }

  const token = authorization.replace("Bearer ", "");
  try {
    const payload = jwt.verify(token, env.JWT_SECRET) as {
      sub: string;
      email: string;
      role: string;
    };

    return {
      token,
      userId: payload.sub,
      email: payload.email,
      role: payload.role
    };
  } catch {
    return {};
  }
}

export function requireAuth(context: AuthContext): asserts context is Required<Pick<AuthContext, "userId" | "email" | "role">> & AuthContext {
  if (!context.userId) {
    throw new Error("Authentication required");
  }
}
