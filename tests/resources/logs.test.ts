import { test, expect, mock, beforeEach } from "bun:test";
import { LogsResource } from "../../src/resources/logs";
import type { HttpClient } from "../../src/core/http-client";

function createMockHttpClient() {
  return {
    get: mock(() => Promise.resolve({})),
    post: mock(() => Promise.resolve({})),
    patch: mock(() => Promise.resolve({})),
    put: mock(() => Promise.resolve({})),
    delete: mock(() => Promise.resolve({})),
  } as unknown as HttpClient;
}

let http: ReturnType<typeof createMockHttpClient>;
let logs: LogsResource;

beforeEach(() => {
  http = createMockHttpClient();
  logs = new LogsResource(http);
});

test("logs.list - returns paginated logs", async () => {
  const mockResponse = {
    logs: [
      {
        id: "log_001",
        level: "info",
        category: "webhook",
        message: "Inbound webhook from stripe",
        details: null,
        createdAt: "2026-09-05T10:00:00.000Z",
      },
      {
        id: "log_002",
        level: "error",
        category: "payment",
        message: "Payment failed",
        details: "Insufficient funds",
        createdAt: "2026-09-05T10:01:00.000Z",
      },
    ],
    pagination: { page: 1, limit: 50, total: 230, totalPages: 5 },
  };
  (http.get as ReturnType<typeof mock>).mockResolvedValue(mockResponse);

  const result = await logs.list({ page: 1, limit: 50 });

  expect(http.get).toHaveBeenCalledWith("/api/logs", {
    params: { page: 1, limit: 50 },
  });
  expect(result.logs).toHaveLength(2);
  expect(result.pagination.totalPages).toBe(5);
});

test("logs.list - filters by level and category", async () => {
  (http.get as ReturnType<typeof mock>).mockResolvedValue({
    logs: [],
    pagination: { page: 1, limit: 50, total: 0, totalPages: 0 },
  });

  await logs.list({ level: "error", category: "webhook", search: "failed" });

  expect(http.get).toHaveBeenCalledWith("/api/logs", {
    params: { level: "error", category: "webhook", search: "failed" },
  });
});

test("logs.list - handles empty results", async () => {
  (http.get as ReturnType<typeof mock>).mockResolvedValue({
    logs: [],
    pagination: { page: 1, limit: 50, total: 0, totalPages: 0 },
  });

  const result = await logs.list();

  expect(result.logs).toHaveLength(0);
  expect(result.pagination.total).toBe(0);
});
