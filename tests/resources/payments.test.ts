import { test, expect, mock, beforeEach } from "bun:test";
import { PaymentsResource } from "../../src/resources/payments";
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
let payments: PaymentsResource;

beforeEach(() => {
  http = createMockHttpClient();
  payments = new PaymentsResource(http);
});

test("payments.create - sends correct request body", async () => {
  (http.post as ReturnType<typeof mock>).mockResolvedValue({
    transactionId: "clt_abc123",
    referenceId: "ORDER-001",
    gateway: "stripe",
    status: "PENDING",
    amount: 100000,
    currency: "IDR",
  });

  const result = await payments.create({
    amount: 100000,
    referenceId: "ORDER-001",
    gateway: "stripe",
    paymentMethod: "card",
    description: "Test payment",
  });

  expect(http.post).toHaveBeenCalledWith(
    "/api/payments",
    {
      amount: 100000,
      referenceId: "ORDER-001",
      gateway: "stripe",
      paymentMethod: "card",
      description: "Test payment",
    },
    { headers: {} },
  );
  expect(result.transactionId).toBe("clt_abc123");
  expect(result.status).toBe("PENDING");
  expect(result.amount).toBe(100000);
});

test("payments.create - includes webhook URL header when provided", async () => {
  (http.post as ReturnType<typeof mock>).mockResolvedValue({
    transactionId: "clt_xyz",
    referenceId: "ORDER-002",
    gateway: "xendit",
    status: "PENDING",
    amount: 50000,
    currency: "IDR",
  });

  await payments.create(
    {
      amount: 50000,
      referenceId: "ORDER-002",
      gateway: "xendit",
    },
    "https://example.com/webhook",
  );

  expect(http.post).toHaveBeenCalledWith(
    "/api/payments",
    expect.objectContaining({ amount: 50000 }),
    { headers: { "X-WEBHOOK-URL": "https://example.com/webhook" } },
  );
});

test("payments.create - uses default currency IDR when not specified", async () => {
  (http.post as ReturnType<typeof mock>).mockResolvedValue({
    transactionId: "clt_def",
    referenceId: "ORDER-003",
    gateway: "stripe",
    status: "PENDING",
    amount: 200000,
    currency: "IDR",
  });

  const result = await payments.create({
    amount: 200000,
    referenceId: "ORDER-003",
  });

  expect(result.currency).toBe("IDR");
});

test("payments.get - fetches payment by transaction ID", async () => {
  const mockResponse = {
    transactionId: "clt_abc123",
    referenceId: "ORDER-001",
    gateway: "stripe",
    status: "SUCCESS",
    amount: 100000,
    currency: "IDR",
    paymentMethod: "card",
    description: "Test payment",
    gatewayCode: "succeeded",
    gatewayMessage: "Payment processed",
    redirectUrl: "https://checkout.stripe.com/xxx",
    createdAt: "2026-09-05T10:00:00.000Z",
    updatedAt: "2026-09-05T10:01:00.000Z",
  };
  (http.get as ReturnType<typeof mock>).mockResolvedValue(mockResponse);

  const result = await payments.get("clt_abc123" as TransactionId);

  expect(http.get).toHaveBeenCalledWith("/api/payments/clt_abc123");
  expect(result.status).toBe("SUCCESS");
  expect(result.paymentMethod).toBe("card");
  expect(result.gatewayCode).toBe("succeeded");
  expect(result.redirectUrl).toBe("https://checkout.stripe.com/xxx");
});

test("payments.get - returns full response with all fields", async () => {
  (http.get as ReturnType<typeof mock>).mockResolvedValue({
    transactionId: "clt_full",
    referenceId: "ORDER-FULL",
    gateway: "midtrans",
    status: "PENDING",
    amount: 75000,
    currency: "IDR",
    paymentMethod: "ewallet",
    description: null,
    gatewayCode: null,
    gatewayMessage: null,
    redirectUrl: null,
    createdAt: "2026-09-05T10:00:00.000Z",
    updatedAt: "2026-09-05T10:00:00.000Z",
  });

  const result = await payments.get("clt_full" as TransactionId);

  expect(result.description).toBeNull();
  expect(result.gatewayCode).toBeNull();
  expect(result.redirectUrl).toBeNull();
});
