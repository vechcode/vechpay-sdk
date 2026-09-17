import { test, expect, mock, beforeEach } from "bun:test";
import { ApiKeysResource } from "../../src/resources/api-keys";
import type { HttpClient } from "../../src/core/http-client";
import type { ApiKeyId } from "../../src/types/common";

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
let apiKeys: ApiKeysResource;

beforeEach(() => {
  http = createMockHttpClient();
  apiKeys = new ApiKeysResource(http);
});

test("apiKeys.list - returns paginated results", async () => {
  const mockResponse = {
    keys: [
      {
        id: "ak_001",
        name: "Production Key",
        keyPrefix: "vk_abc1...",
        status: "active",
        gateways: ["stripe", "xendit"],
        environment: "sandbox",
        clientName: "Acme Corp",
        lastUsedAt: "2026-09-05T10:00:00.000Z",
        createdAt: "2026-01-01T00:00:00.000Z",
      },
    ],
    pagination: { page: 1, limit: 25, total: 1, totalPages: 1 },
  };
  (http.get as ReturnType<typeof mock>).mockResolvedValue(mockResponse);

  const result = await apiKeys.list({ status: "active" });

  expect(http.get).toHaveBeenCalledWith("/api/api-keys", {
    params: { status: "active" },
  });
  expect(result.keys).toHaveLength(1);
  expect(result.keys[0].gateways).toEqual(["stripe", "xendit"]);
});

test("apiKeys.create - returns raw key", async () => {
  const mockResponse = {
    id: "ak_new",
    name: "New Key",
    keyPrefix: "vk_xyz1...",
    key: "vk_xyz1fullkeyxxxxx",
    status: "active",
    gateways: ["stripe"],
    environment: "sandbox",
    createdAt: "2026-09-05T00:00:00.000Z",
  };
  (http.post as ReturnType<typeof mock>).mockResolvedValue(mockResponse);

  const result = await apiKeys.create({
    clientId: "cli_001",
    name: "New Key",
    gateways: ["stripe"],
  });

  expect(http.post).toHaveBeenCalledWith("/api/api-keys", {
    clientId: "cli_001",
    name: "New Key",
    gateways: ["stripe"],
  });
  expect(result.key).toBe("vk_xyz1fullkeyxxxxx");
  expect(result.status).toBe("active");
});

test("apiKeys.update - patches key fields", async () => {
  const mockResponse = {
    id: "ak_001",
    name: "Updated Key",
    keyPrefix: "vk_abc1...",
    status: "revoked",
    gateways: ["stripe"],
    environment: "sandbox",
    clientName: "Acme Corp",
    lastUsedAt: null,
    createdAt: "2026-01-01T00:00:00.000Z",
  };
  (http.patch as ReturnType<typeof mock>).mockResolvedValue(mockResponse);

  const result = await apiKeys.update("ak_001" as ApiKeyId, {
    name: "Updated Key",
    status: "revoked",
  });

  expect(http.patch).toHaveBeenCalledWith("/api/api-keys/ak_001", {
    name: "Updated Key",
    status: "revoked",
  });
  expect(result.status).toBe("revoked");
});

test("apiKeys.delete - removes key", async () => {
  (http.delete as ReturnType<typeof mock>).mockResolvedValue({ success: true });

  const result = await apiKeys.delete("ak_001" as ApiKeyId);

  expect(http.delete).toHaveBeenCalledWith("/api/api-keys/ak_001");
  expect(result.success).toBe(true);
});
