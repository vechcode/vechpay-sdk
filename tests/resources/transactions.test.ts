import { test, expect, mock, beforeEach } from "bun:test";
import { TransactionsResource } from "../../src/resources/transactions";
import type { HttpClient } from "../../src/core/http-client";
import type { TransactionId } from "../../src/types/common";

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
let transactions: TransactionsResource;

beforeEach(() => {
  http = createMockHttpClient();
  transactions = new TransactionsResource(http);
});

test("transactions.list - returns paginated results with stats", async () => {
  const mockResponse = {
    transactions: [
      {
        id: "clt_001",
        referenceId: "ORDER-001",
        gateway: "stripe",
        amount: 100000,
        currency: "IDR",
        status: "SUCCESS",
        paymentMethod: "card",
        description: "Payment",
        createdAt: "2026-09-05T10:00:00.000Z",
        client: { id: "cli_001", name: "Acme Corp" },
        invoice: { id: "inv_001", invoiceNumber: "INV-2026-001" },
      },
    ],
    pagination: { page: 1, limit: 50, total: 1543, totalPages: 31 },
    stats: [
      { status: "SUCCESS", _count: 1200, _sum: { amount: 120000000 } },
      { status: "FAILED", _count: 200, _sum: { amount: 20000000 } },
    ],
  };
  (http.get as ReturnType<typeof mock>).mockResolvedValue(mockResponse);

  const result = await transactions.list({
    page: 1,
    limit: 50,
    status: "SUCCESS",
    gateway: "stripe",
    sortBy: "createdAt",
    sortDir: "desc",
  });

  expect(http.get).toHaveBeenCalledWith("/api/transactions", {
    params: {
      page: 1,
      limit: 50,
      status: "SUCCESS",
      gateway: "stripe",
      sortBy: "createdAt",
      sortDir: "desc",
    },
  });
  expect(result.transactions).toHaveLength(1);
  expect(result.stats).toHaveLength(2);
  expect(result.stats[0]._count).toBe(1200);
});

test("transactions.list - filters by payment method", async () => {
  (http.get as ReturnType<typeof mock>).mockResolvedValue({
    transactions: [],
    pagination: { page: 1, limit: 50, total: 0, totalPages: 0 },
    stats: [],
  });

  await transactions.list({ paymentMethod: "ewallet" });

  expect(http.get).toHaveBeenCalledWith("/api/transactions", {
    params: { paymentMethod: "ewallet" },
  });
});

test("transactions.delete - removes transaction", async () => {
  (http.delete as ReturnType<typeof mock>).mockResolvedValue({ success: true });

  const result = await transactions.delete("clt_001" as TransactionId);

  expect(http.delete).toHaveBeenCalledWith("/api/transactions/clt_001");
  expect(result.success).toBe(true);
});

test("transactions.charge - triggers charge for pending transaction", async () => {
  const mockResponse = {
    transactionId: "clt_001",
    status: "SUCCESS",
    gatewayCode: "succeeded",
    gatewayMessage: "Payment processed",
  };
  (http.get as ReturnType<typeof mock>).mockResolvedValue(mockResponse);

  const result = await transactions.charge("clt_001" as TransactionId);

  expect(http.get).toHaveBeenCalledWith("/api/charge/clt_001");
  expect(result.status).toBe("SUCCESS");
  expect(result.gatewayCode).toBe("succeeded");
});
