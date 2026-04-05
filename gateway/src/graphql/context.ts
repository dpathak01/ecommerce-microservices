import type { Logger } from "pino";
import type { AuthContext } from "../middleware/auth";
import type { RequestMetadata } from "../observability/request";
import type { GatewayLoaders } from "./loaders";

export type GraphQLContext = {
  auth: AuthContext;
  loaders: GatewayLoaders;
  logger: Logger;
  requestMetadata: RequestMetadata;
};

