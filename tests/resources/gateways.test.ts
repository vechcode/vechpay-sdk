import { test, expect, mock, beforeEach } from "bun:test";
import { GatewaysResource } from "../../src/resources/gateways";
import type { HttpClient } from "../../src/core/http-client";
import type { GatewayId } from "../../src/types/common";

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
let gateways: GatewaysResource;

beforeEach(() => {
  http = createMockHttpClient();
  gateways = new GatewaysResource(http);
});

test("gateways.list - returns all gateways", async () => {
  const mockResponse = [
    {
      id: "gw_001",
      name: "Stripe Production",
      gateway: "stripe",
      environment: "production",
      enabled: true,
      transactionCount: 800,
      createdAt: "2026-01-01T00:00:00.000Z",
      updatedAt: "2026-09-05T00:00:00.000Z",
    },
    {
      id: "gw_002",
      name: "Xendit Sandbox",
      gateway: "xendit",
      environment: "sandbox",
      enabled: true,
      transactionCount: 200,
      createdAt: "2026-01-01T00:00:00.000Z",
      updatedAt: "2026-09-05T00:00:00.000Z",
    },
  ];
  (http.get as ReturnType<typeof mock>).mockResolvedValue(mockResponse);

  const result = await gateways.list();

  expect(http.get).toHaveBeenCalledWith("/api/gateways", { params: undefined });
  expect(result).toHaveLength(2);
  expect(result[0].gateway).toBe("stripe");
});

test("gateways.list - filters by gateway type", async () => {
  (http.get as ReturnType<typeof mock>).mockResolvedValue([]);

  await gateways.list({ gateway: "midtrans" });

  expect(http.get).toHaveBeenCalledWith("/api/gateways", {
    params: { gateway: "midtrans" },
  });
});

test("gateways.create - sends credentials", async () => {
  const mockResponse = {
    id: "gw_new",
    name: "Stripe Production",
    gateway: "stripe",
    environment: "production",
    enabled: true,
    transactionCount: 0,
    createdAt: "2026-09-05T00:00:00.000Z",
    updatedAt: "2026-09-05T00:00:00.000Z",
  };
  (http.post as ReturnType<typeof mock>).mockResolvedValue(mockResponse);

  const result = await gateways.create({
    name: "Stripe Production",
    gateway: "stripe",
    environment: "production",
    credentials: {
      secretKey: "sk_live_xxx",
      publishableKey: "pk_live_xxx",
      webhookSecret: "whsec_xxx",
    },
  });

  expect(http.post).toHaveBeenCalledWith("/api/gateways", {
    name: "Stripe Production",
    gateway: "stripe",
    environment: "production",
    credentials: {
      secretKey: "sk_live_xxx",
      publishableKey: "pk_live_xxx",
      webhookSecret: "whsec_xxx",
    },
  });
  expect(result.id).toBe("gw_new");
});

test("gateways.update - patches gateway fields", async () => {
  const mockResponse = {
    id: "gw_001",
    name: "Stripe Updated",
    gateway: "stripe",
    environment: "production",
    enabled: false,
    transactionCount: 800,
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-09-05T00:00:00.000Z",
  };
  (http.patch as ReturnType<typeof mock>).mockResolvedValue(mockResponse);

  const result = await gateways.update("gw_001" as GatewayId, {
    name: "Stripe Updated",
    enabled: false,
  });

  expect(http.patch).toHaveBeenCalledWith("/api/gateways/gw_001", {
    name: "Stripe Updated",
    enabled: false,
  });
  expect(result.enabled).toBe(false);
});

test("gateways.delete - removes gateway", async () => {
  (http.delete as ReturnType<typeof mock>).mockResolvedValue({ success: true });

  const result = await gateways.delete("gw_001" as GatewayId);

  expect(http.delete).toHaveBeenCalledWith("/api/gateways/gw_001");
  expect(result.success).toBe(true);
});
