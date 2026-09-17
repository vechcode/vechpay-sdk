import { test, expect, mock, beforeEach, afterEach } from "bun:test";
import { HttpClient } from "../../src/core/http-client";
import { VechPayError } from "../../src/core/errors";

const ORIGINAL_FETCH = globalThis.fetch;

afterEach(() => {
  globalThis.fetch = ORIGINAL_FETCH;
});

function mockFetch(response: {
  ok?: boolean;
  status?: number;
  body?: unknown;
  headers?: Record<string, string>;
}) {
  const headers = new Map(Object.entries(response.headers ?? {}));
  globalThis.fetch = mock(() =>
    Promise.resolve({
      ok: response.ok ?? true,
      status: response.status ?? 200,
      text: () => Promise.resolve(JSON.stringify(response.body ?? {})),
      headers: {
        get: (name: string) => headers.get(name.toLowerCase()) ?? null,
      },
    }),
  ) as typeof fetch;
}

test("HttpClient.get - sends GET request with API key", async () => {
  mockFetch({ body: { id: "test" } });

  const http = new HttpClient({ apiKey: "vk_test_key" });
  const result = await http.get("/api/test");

  expect(globalThis.fetch).toHaveBeenCalledWith(
    "https://pay.vechcode.com/api/test",
    expect.objectContaining({
      method: "GET",
      headers: expect.objectContaining({
        "X-API-KEY": "vk_test_key",
      }) as Record<string, string>,
    }),
  );
  expect(result).toEqual({ id: "test" });
});

test("HttpClient.post - sends POST with JSON body", async () => {
  mockFetch({ status: 201, body: { created: true } });

  const http = new HttpClient({ apiKey: "vk_key" });
  const result = await http.post("/api/create", { name: "test" });

  expect(globalThis.fetch).toHaveBeenCalledWith(
    "https://pay.vechcode.com/api/create",
    expect.objectContaining({
      method: "POST",
      body: JSON.stringify({ name: "test" }),
    }),
  );
  expect(result).toEqual({ created: true });
});

test("HttpClient.patch - sends PATCH request", async () => {
  mockFetch({ body: { updated: true } });

  const http = new HttpClient({ apiKey: "vk_key" });
  await http.patch("/api/update", { name: "new" });

  expect(globalThis.fetch).toHaveBeenCalledWith(
    "https://pay.vechcode.com/api/update",
    expect.objectContaining({ method: "PATCH" }),
  );
});

test("HttpClient.put - sends PUT request", async () => {
  mockFetch({ body: { success: true } });

  const http = new HttpClient({ apiKey: "vk_key" });
  await http.put("/api/settings", { settings: [] });

  expect(globalThis.fetch).toHaveBeenCalledWith(
    "https://pay.vechcode.com/api/settings",
    expect.objectContaining({ method: "PUT" }),
  );
});

test("HttpClient.delete - sends DELETE request", async () => {
  mockFetch({ body: { success: true } });

  const http = new HttpClient({ apiKey: "vk_key" });
  const result = await http.delete("/api/items/123");

  expect(globalThis.fetch).toHaveBeenCalledWith(
    "https://pay.vechcode.com/api/items/123",
    expect.objectContaining({ method: "DELETE" }),
  );
  expect(result).toEqual({ success: true });
});

test("HttpClient - throws VechPayError on non-ok response", async () => {
  mockFetch({
    ok: false,
    status: 401,
    body: { error: "Unauthorized", code: "AUTH_FAILED" },
  });

  const http = new HttpClient({ apiKey: "vk_bad_key" });

  await expect(http.get("/api/protected")).rejects.toThrow(VechPayError);
  await expect(http.get("/api/protected")).rejects.toThrow("Unauthorized");
});

test("HttpClient - uses custom base URL", async () => {
  mockFetch({ body: {} });

  const http = new HttpClient({
    apiKey: "vk_key",
    baseUrl: "https://custom.api.com",
  });
  await http.get("/api/test");

  expect(globalThis.fetch).toHaveBeenCalledWith(
    "https://custom.api.com/api/test",
    expect.anything(),
  );
});

test("HttpClient - appends query params to URL", async () => {
  mockFetch({ body: [] });

  const http = new HttpClient({ apiKey: "vk_key" });
  await http.get("/api/items", { params: { page: 1, limit: 10 } });

  expect(globalThis.fetch).toHaveBeenCalledWith(
    "https://pay.vechcode.com/api/items?page=1&limit=10",
    expect.anything(),
  );
});

test("HttpClient - session auth uses Cookie header", async () => {
  mockFetch({ body: { user: "admin" } });

  const http = new HttpClient({ useSessionAuth: true });
  http.setSessionCookie("session=abc123");
  await http.get("/api/me");

  expect(globalThis.fetch).toHaveBeenCalledWith(
    expect.anything(),
    expect.objectContaining({
      headers: expect.objectContaining({
        Cookie: "session=abc123",
      }) as Record<string, string>,
    }),
  );
});

test("HttpClient - session auth without cookie omits Cookie header", async () => {
  mockFetch({ body: {} });

  const http = new HttpClient({ useSessionAuth: true });
  await http.get("/api/me");

  const callHeaders = (globalThis.fetch as ReturnType<typeof mock>).mock.calls[0]?.[1]?.headers as Record<string, string>;
  expect(callHeaders?.Cookie).toBeUndefined();
});

test("HttpClient - respects custom timeout", async () => {
  mockFetch({ body: {} });

  const http = new HttpClient({ apiKey: "vk_key", timeout: 5000 });
  await http.get("/api/test");

  expect(globalThis.fetch).toHaveBeenCalled();
});

test("HttpClient - sends extra headers", async () => {
  mockFetch({ body: {} });

  const http = new HttpClient({ apiKey: "vk_key" });
  await http.post("/api/payments", { amount: 100 }, {
    headers: { "X-WEBHOOK-URL": "https://hook.example.com" },
  });

  expect(globalThis.fetch).toHaveBeenCalledWith(
    expect.anything(),
    expect.objectContaining({
      headers: expect.objectContaining({
        "X-WEBHOOK-URL": "https://hook.example.com",
      }) as Record<string, string>,
    }),
  );
});

test("HttpClient - captures Set-Cookie header from response", async () => {
  mockFetch({
    body: { success: true },
    headers: { "set-cookie": "session=abc123; Path=/; HttpOnly" },
  });

  const http = new HttpClient({ useSessionAuth: true });
  await http.post("/api/auth/login", { email: "test@example.com" });

  expect(http.getLastSetCookie()).toBe("session=abc123; Path=/; HttpOnly");
  expect(http.getSessionCookie()).toBe("session=abc123; Path=/; HttpOnly");
});

test("HttpClient - does not auto-set session cookie for non-session auth", async () => {
  mockFetch({
    body: { success: true },
    headers: { "set-cookie": "session=abc123" },
  });

  const http = new HttpClient({ apiKey: "vk_key" });
  await http.get("/api/test");

  expect(http.getLastSetCookie()).toBe("session=abc123");
  expect(http.getSessionCookie()).toBeNull();
});
