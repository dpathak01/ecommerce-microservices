import type { Logger } from "pino";
import {
  getServiceName,
  OPERATION_NAME_HEADER,
  REQUEST_ID_HEADER,
  type RequestMetadata,
  USER_ID_HEADER,
  USER_ROLE_HEADER
} from "../observability/request";

export type DownstreamRequestContext = {
  logger: Logger;
  requestMetadata: RequestMetadata;
};

export async function http<T>(url: string, init?: RequestInit, context?: DownstreamRequestContext): Promise<T> {
  const headers = new Headers(init?.headers);
  headers.set("content-type", "application/json");

  if (context) {
    headers.set(REQUEST_ID_HEADER, context.requestMetadata.requestId);

    if (context.requestMetadata.operationName) {
      headers.set(OPERATION_NAME_HEADER, context.requestMetadata.operationName);
    }

    if (context.requestMetadata.userId) {
      headers.set(USER_ID_HEADER, context.requestMetadata.userId);
    }

    if (context.requestMetadata.userRole) {
      headers.set(USER_ROLE_HEADER, context.requestMetadata.userRole);
    }
  }

  const method = init?.method ?? "GET";
  const service = getServiceName(url);
  const path = (() => {
    try {
      return new URL(url).pathname;
    } catch {
      return url;
    }
  })();
  const startedAt = process.hrtime.bigint();

  let response: Response;

  try {
    response = await fetch(url, {
      ...init,
      headers
    });
  } catch (error) {
    if (context) {
      const durationMs = Number(process.hrtime.bigint() - startedAt) / 1_000_000;
      context.logger.error(
        {
          ...context.requestMetadata,
          service,
          method,
          path,
          durationMs: Number(durationMs.toFixed(2)),
          error
        },
        "Downstream service request failed"
      );
    }

    throw error;
  }

  const durationMs = Number(process.hrtime.bigint() - startedAt) / 1_000_000;
  const logPayload = context
    ? {
        ...context.requestMetadata,
        service,
        method,
        path,
        statusCode: response.status,
        durationMs: Number(durationMs.toFixed(2))
      }
    : undefined;

  if (!response.ok) {
    const text = await response.text();
    context?.logger.error(
      {
        ...logPayload,
        responseBody: text
      },
      "Downstream service request returned non-2xx status"
    );
    throw new Error(`Request failed [${response.status}] ${url}: ${text}`);
  }

  context?.logger.info(logPayload, "Downstream service request completed");

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}
