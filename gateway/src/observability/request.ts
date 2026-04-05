export const REQUEST_ID_HEADER = "x-request-id";
export const USER_ID_HEADER = "x-user-id";
export const USER_ROLE_HEADER = "x-user-role";
export const OPERATION_NAME_HEADER = "x-operation-name";

export type RequestMetadata = {
  requestId: string;
  operationName?: string;
  userId?: string;
  userRole?: string;
};

type HeaderValue = string | string[] | undefined;

export function getHeaderValue(value: HeaderValue): string | undefined {
  if (Array.isArray(value)) {
    return value[0];
  }

  return value;
}

export function getGraphQLOperationName(body: unknown): string | undefined {
  if (!body || typeof body !== "object") {
    return undefined;
  }

  const operationName = (body as { operationName?: unknown }).operationName;
  return typeof operationName === "string" && operationName.length > 0 ? operationName : undefined;
}

export function getServiceName(url: string): string {
  try {
    const { hostname, port } = new URL(url);
    return port ? `${hostname}:${port}` : hostname;
  } catch {
    return "unknown-service";
  }
}

