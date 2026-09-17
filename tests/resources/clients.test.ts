import { test, expect, mock, beforeEach } from "bun:test";
import { ClientsResource } from "../../src/resources/clients";
import type { HttpClient } from "../../src/core/http-client";
import type { ClientId } from "../../src/types/common";

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
let clients: ClientsResource;

beforeEach(() => {
  http = createMockHttpClient();
  clients = new ClientsResource(http);
});

test("clients.list - returns paginated results", async () => {
  const mockResponse = {
    clients: [
      {
        id: "cli_001",
        name: "Acme Corp",
        description: "Enterprise client",
        environment: "sandbox",
        active: true,
        apiKeyCount: 3,
        transactionCount: 150,
        createdAt: "2026-01-01T00:00:00.000Z",
      },
    ],
    pagination: { page: 1, limit: 25, total: 1, totalPages: 1 },
  };
  (http.get as ReturnType<typeof mock>).mockResolvedValue(mockResponse);

  const result = await clients.list({ page: 1, limit: 25, search: "Acme" });

  expect(http.get).toHaveBeenCalledWith("/api/clients", {
    params: { page: 1, limit: 25, search: "Acme" },
  });
  expect(result.clients).toHaveLength(1);
  expect(result.clients[0].name).toBe("Acme Corp");
});

test("clients.list - filters by environment", async () => {
  (http.get as ReturnType<typeof mock>).mockResolvedValue({
    clients: [],
    pagination: { page: 1, limit: 25, total: 0, totalPages: 0 },
  });

  await clients.list({ environment: "production" });

  expect(http.get).toHaveBeenCalledWith("/api/clients", {
    params: { environment: "production" },
  });
});

test("clients.create - sends correct body", async () => {
  const mockResponse = {
    id: "cli_new",
    name: "New Client",
    description: "A new client",
    environment: "sandbox",
    active: true,
    apiKeyCount: 0,
    transactionCount: 0,
    createdAt: "2026-09-05T00:00:00.000Z",
  };
  (http.post as ReturnType<typeof mock>).mockResolvedValue(mockResponse);

  const result = await clients.create({
    name: "New Client",
    description: "A new client",
    environment: "sandbox",
  });

  expect(http.post).toHaveBeenCalledWith("/api/clients", {
    name: "New Client",
    description: "A new client",
    environment: "sandbox",
  });
  expect(result.id).toBe("cli_new");
  expect(result.active).toBe(true);
});

test("clients.update - patches client fields", async () => {
  const mockResponse = {
    id: "cli_001",
    name: "Updated Name",
    description: "Updated description",
    environment: "production",
    active: false,
    apiKeyCount: 3,
    transactionCount: 150,
    createdAt: "2026-01-01T00:00:00.000Z",
  };
  (http.patch as ReturnType<typeof mock>).mockResolvedValue(mockResponse);

  const result = await clients.update("cli_001" as ClientId, {
    name: "Updated Name",
    active: false,
  });

  expect(http.patch).toHaveBeenCalledWith("/api/clients/cli_001", {
    name: "Updated Name",
    active: false,
  });
  expect(result.name).toBe("Updated Name");
  expect(result.active).toBe(false);
});

test("clients.delete - removes client", async () => {
  (http.delete as ReturnType<typeof mock>).mockResolvedValue({ success: true });

  const result = await clients.delete("cli_001" as ClientId);

  expect(http.delete).toHaveBeenCalledWith("/api/clients/cli_001");
  expect(result.success).toBe(true);
});

test("clients.delete - throws on 400 (has keys/transactions)", async () => {
  const { VechPayError } = await import("../../src/core/errors");
  (http.delete as ReturnType<typeof mock>).mockRejectedValue(
    new VechPayError("Client has existing API keys", "VALIDATION_ERROR", 400),
  );

  await expect(clients.delete("cli_001" as ClientId)).rejects.toThrow(
    "Client has existing API keys",
  );
});
