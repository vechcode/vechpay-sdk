import { test, expect, mock, beforeEach, afterEach } from "bun:test";
import { VechPayError, createErrorFromResponse } from "../../src/core/errors";
import { ErrorCode } from "../../src/types/common";

test("VechPayError - has correct properties", () => {
  const error = new VechPayError(
    "Invalid API key",
    "AUTH_FAILED" as ErrorCode,
    401,
  );

  expect(error).toBeInstanceOf(Error);
  expect(error).toBeInstanceOf(VechPayError);
  expect(error.name).toBe("VechPayError");
  expect(error.message).toBe("Invalid API key");
  expect(error.code).toBe("AUTH_FAILED");
  expect(error.status).toBe(401);
  expect(error.details).toBeUndefined();
});

test("VechPayError - includes details when provided", () => {
  const details = { amount: ["Must be positive"] };
  const error = new VechPayError(
    "Validation failed",
    "VALIDATION_ERROR" as ErrorCode,
    400,
    details,
  );

  expect(error.details).toEqual(details);
  expect(error.details?.amount).toEqual(["Must be positive"]);
});

test("createErrorFromResponse - parses structured error body", () => {
  const body = {
    error: "Duplicate reference",
    code: "DUPLICATE_REFERENCE",
    details: { referenceId: ["Already exists"] },
  };

  const error = createErrorFromResponse(409, body);

  expect(error).toBeInstanceOf(VechPayError);
  expect(error.message).toBe("Duplicate reference");
  expect(error.code).toBe("DUPLICATE_REFERENCE");
  expect(error.status).toBe(409);
  expect(error.details?.referenceId).toEqual(["Already exists"]);
});

test("createErrorFromResponse - falls back to HTTP status mapping", () => {
  const body = { message: "Something went wrong" };

  const error = createErrorFromResponse(401, body);

  expect(error.code).toBe("AUTH_FAILED");
  expect(error.status).toBe(401);
});

test("createErrorFromResponse - maps 400 to VALIDATION_ERROR", () => {
  const error = createErrorFromResponse(400, { error: "Bad request" });
  expect(error.code).toBe("VALIDATION_ERROR");
});

test("createErrorFromResponse - maps 403 to GATEWAY_FORBIDDEN", () => {
  const error = createErrorFromResponse(403, { error: "Forbidden" });
  expect(error.code).toBe("GATEWAY_FORBIDDEN");
});

test("createErrorFromResponse - maps 404 to NOT_FOUND", () => {
  const error = createErrorFromResponse(404, { error: "Not found" });
  expect(error.code).toBe("NOT_FOUND");
});

test("createErrorFromResponse - maps 409 to DUPLICATE_REFERENCE", () => {
  const error = createErrorFromResponse(409, { error: "Conflict" });
  expect(error.code).toBe("DUPLICATE_REFERENCE");
});

test("createErrorFromResponse - handles non-object body", () => {
  const error = createErrorFromResponse(500, "server error");
  expect(error.code).toBe("VALIDATION_ERROR");
  expect(error.message).toContain("500");
});
