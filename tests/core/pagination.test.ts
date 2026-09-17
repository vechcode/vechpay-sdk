import { test, expect } from "bun:test";
import { buildQueryString } from "../../src/utils/query-builder";

test("buildQueryString - returns empty string for undefined", () => {
  expect(buildQueryString(undefined)).toBe("");
});

test("buildQueryString - returns empty string for empty object", () => {
  expect(buildQueryString({})).toBe("");
});

test("buildQueryString - builds simple query string", () => {
  const result = buildQueryString({ page: 1, limit: 25 });
  expect(result).toBe("?page=1&limit=25");
});

test("buildQueryString - filters out undefined values", () => {
  const result = buildQueryString({
    page: 1,
    search: undefined,
    limit: 25,
  });
  expect(result).toBe("?page=1&limit=25");
  expect(result).not.toContain("search");
});

test("buildQueryString - handles string values", () => {
  const result = buildQueryString({ search: "hello world" });
  expect(result).toBe("?search=hello+world");
});

test("buildQueryString - handles boolean values", () => {
  const result = buildQueryString({ active: true });
  expect(result).toBe("?active=true");
});

test("buildQueryString - encodes special characters", () => {
  const result = buildQueryString({ search: "foo&bar=baz" });
  expect(result).toContain("search=foo%26bar%3Dbaz");
});

test("buildQueryString - handles single param", () => {
  const result = buildQueryString({ page: 1 });
  expect(result).toBe("?page=1");
});

test("buildQueryString - handles many params", () => {
  const result = buildQueryString({
    page: 1,
    limit: 50,
    status: "SUCCESS",
    gateway: "stripe",
    sortDir: "desc",
  });
  const params = new URLSearchParams(result.slice(1));
  expect(params.get("page")).toBe("1");
  expect(params.get("limit")).toBe("50");
  expect(params.get("status")).toBe("SUCCESS");
  expect(params.get("gateway")).toBe("stripe");
  expect(params.get("sortDir")).toBe("desc");
});
