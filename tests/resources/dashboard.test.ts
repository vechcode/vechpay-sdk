import { test, expect, mock, beforeEach } from "bun:test";
import { DashboardResource } from "../../src/resources/dashboard";
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
let dashboard: DashboardResource;

beforeEach(() => {
  http = createMockHttpClient();
  dashboard = new DashboardResource(http);
});

test("dashboard.getStats - returns full stats", async () => {
  const mockResponse = {
    totalClients: 12,
    totalTransactions: 1543,
    successfulTransactions: 1200,
    totalAmount: 150000000,
    successRate: "77.8",
    recentTransactions: [
      {
        id: "clt_001",
        referenceId: "ORDER-001",
        gateway: "stripe",
        amount: 100000,
        currency: "IDR",
        status: "SUCCESS",
        createdAt: "2026-09-05T10:00:00.000Z",
        clientName: "Acme Corp",
      },
    ],
    statusBreakdown: [
      { status: "SUCCESS", _count: 1200 },
      { status: "FAILED", _count: 200 },
    ],
    gatewayBreakdown: [
      { gateway: "stripe", _count: 800, totalAmount: 80000000 },
      { gateway: "xendit", _count: 400, totalAmount: 40000000 },
    ],
  };
  (http.get as ReturnType<typeof mock>).mockResolvedValue(mockResponse);

  const result = await dashboard.getStats();

  expect(http.get).toHaveBeenCalledWith("/api/dashboard");
  expect(result.totalClients).toBe(12);
  expect(result.totalTransactions).toBe(1543);
  expect(result.successRate).toBe("77.8");
  expect(result.recentTransactions).toHaveLength(1);
  expect(result.statusBreakdown).toHaveLength(2);
  expect(result.gatewayBreakdown).toHaveLength(2);
});
