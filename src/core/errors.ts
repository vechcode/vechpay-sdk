import type { ErrorCode } from "../types/common";

export class VechPayError extends Error {
  readonly code: ErrorCode;
  readonly status: number;
  readonly details?: Record<string, string[]>;

  constructor(
    message: string,
    code: ErrorCode,
    status: number,
    details?: Record<string, string[]>,
  ) {
    super(message);
    this.name = "VechPayError";
    this.code = code;
    this.status = status;
    this.details = details;
  }
}

const HTTP_STATUS_MAP: Record<number, ErrorCode> = {
  400: "VALIDATION_ERROR" as ErrorCode,
  401: "AUTH_FAILED" as ErrorCode,
  403: "GATEWAY_FORBIDDEN" as ErrorCode,
  404: "NOT_FOUND" as ErrorCode,
  409: "DUPLICATE_REFERENCE" as ErrorCode,
};

export function createErrorFromResponse(
  status: number,
  body: unknown,
): VechPayError {
  if (
    typeof body === "object" &&
    body !== null &&
    "code" in body &&
    "error" in body
  ) {
    const errBody = body as {
      error: string;
      code: ErrorCode;
      details?: Record<string, string[]>;
    };
    return new VechPayError(errBody.error, errBody.code, status, errBody.details);
  }

  const code = HTTP_STATUS_MAP[status] ?? ("VALIDATION_ERROR" as ErrorCode);
  const message =
    typeof body === "object" && body !== null && "error" in body
      ? String((body as { error: unknown }).error)
      : `Request failed with status ${status}`;

  return new VechPayError(message, code, status);
}
