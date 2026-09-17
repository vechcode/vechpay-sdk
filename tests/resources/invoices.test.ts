import { test, expect, mock, beforeEach } from "bun:test";
import { InvoicesResource } from "../../src/resources/invoices";
import type { HttpClient } from "../../src/core/http-client";
import type { InvoiceId } from "../../src/types/common";

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
let invoices: InvoicesResource;

beforeEach(() => {
  http = createMockHttpClient();
  invoices = new InvoicesResource(http);
});

test("invoices.list - returns paginated results", async () => {
  const mockResponse = {
    invoices: [
      {
        id: "inv_001",
        invoiceNumber: "INV-2026-001",
        status: "sent",
        clientId: "cli_001",
        subtotal: 100000,
        taxRate: 11,
        taxAmount: 11000,
        discountAmount: 0,
        total: 111000,
        currency: "IDR",
        lineItems: [],
        notes: null,
        issuedAt: "2026-09-05T00:00:00.000Z",
        dueAt: "2026-09-12T00:00:00.000Z",
        paidAt: null,
        createdAt: "2026-09-05T00:00:00.000Z",
        updatedAt: "2026-09-05T00:00:00.000Z",
        client: { id: "cli_001", name: "Acme Corp" },
        transaction: null,
      },
    ],
    pagination: { page: 1, limit: 25, total: 1, totalPages: 1 },
    stats: { draft: 0, sent: 1, viewed: 0, paid: 0, overdue: 0, cancelled: 0 },
  };
  (http.get as ReturnType<typeof mock>).mockResolvedValue(mockResponse);

  const result = await invoices.list({ page: 1, limit: 25 });

  expect(http.get).toHaveBeenCalledWith("/api/invoices", {
    params: { page: 1, limit: 25 },
  });
  expect(result.invoices).toHaveLength(1);
  expect(result.pagination.total).toBe(1);
  expect(result.stats.sent).toBe(1);
});

test("invoices.list - filters by status and clientId", async () => {
  (http.get as ReturnType<typeof mock>).mockResolvedValue({
    invoices: [],
    pagination: { page: 1, limit: 25, total: 0, totalPages: 0 },
    stats: { draft: 0, sent: 0, viewed: 0, paid: 0, overdue: 0, cancelled: 0 },
  });

  await invoices.list({ status: "paid", clientId: "cli_001" });

  expect(http.get).toHaveBeenCalledWith("/api/invoices", {
    params: { status: "paid", clientId: "cli_001" },
  });
});

test("invoices.create - sends correct body", async () => {
  const mockResponse = {
    id: "inv_new",
    invoiceNumber: "INV-2026-002",
    status: "draft",
    clientId: "cli_001",
    subtotal: 500000,
    taxRate: 11,
    taxAmount: 55000,
    discountAmount: 0,
    total: 555000,
    currency: "IDR",
    lineItems: [
      { description: "Web Development", quantity: 1, unitPrice: 500000, amount: 500000 },
    ],
    notes: "Net 7 days",
    issuedAt: "2026-09-05T00:00:00.000Z",
    dueAt: "2026-09-12T00:00:00.000Z",
    paidAt: null,
    createdAt: "2026-09-05T00:00:00.000Z",
    updatedAt: "2026-09-05T00:00:00.000Z",
    client: { id: "cli_001", name: "Acme Corp" },
    transaction: { id: "clt_txn", referenceId: "INV-2026-002", status: "PENDING", expiresAt: null },
  };
  (http.post as ReturnType<typeof mock>).mockResolvedValue(mockResponse);

  const result = await invoices.create({
    clientId: "cli_001",
    gateway: "stripe",
    paymentMethod: "card",
    lineItems: [
      { description: "Web Development", quantity: 1, unitPrice: 500000 },
    ],
    taxRate: 11,
    notes: "Net 7 days",
    dueAt: "2026-09-12",
  });

  expect(http.post).toHaveBeenCalledWith("/api/invoices", {
    clientId: "cli_001",
    gateway: "stripe",
    paymentMethod: "card",
    lineItems: [
      { description: "Web Development", quantity: 1, unitPrice: 500000 },
    ],
    taxRate: 11,
    notes: "Net 7 days",
    dueAt: "2026-09-12",
  });
  expect(result.total).toBe(555000);
  expect(result.transaction).not.toBeNull();
});

test("invoices.get - fetches invoice by ID", async () => {
  (http.get as ReturnType<typeof mock>).mockResolvedValue({
    id: "inv_001",
    invoiceNumber: "INV-2026-001",
    status: "paid",
    clientId: "cli_001",
    subtotal: 100000,
    taxRate: 11,
    taxAmount: 11000,
    discountAmount: 5000,
    total: 106000,
    currency: "IDR",
    lineItems: [],
    notes: "Thank you",
    issuedAt: "2026-09-05T00:00:00.000Z",
    dueAt: "2026-09-12T00:00:00.000Z",
    paidAt: "2026-09-06T00:00:00.000Z",
    createdAt: "2026-09-05T00:00:00.000Z",
    updatedAt: "2026-09-06T00:00:00.000Z",
    client: { id: "cli_001", name: "Acme Corp" },
    transaction: { id: "clt_txn", referenceId: "INV-2026-001", status: "SUCCESS", expiresAt: null },
  });

  const result = await invoices.get("inv_001" as InvoiceId);

  expect(http.get).toHaveBeenCalledWith("/api/invoices/inv_001");
  expect(result.status).toBe("paid");
  expect(result.paidAt).toBe("2026-09-06T00:00:00.000Z");
});

test("invoices.update - patches invoice fields", async () => {
  (http.patch as ReturnType<typeof mock>).mockResolvedValue({
    id: "inv_001",
    invoiceNumber: "INV-2026-001",
    status: "sent",
    clientId: "cli_001",
    subtotal: 600000,
    taxRate: 11,
    taxAmount: 66000,
    discountAmount: 10000,
    total: 656000,
    currency: "IDR",
    lineItems: [{ description: "Updated", quantity: 1, unitPrice: 600000, amount: 600000 }],
    notes: "Updated terms",
    issuedAt: "2026-09-05T00:00:00.000Z",
    dueAt: "2026-09-12T00:00:00.000Z",
    paidAt: null,
    createdAt: "2026-09-05T00:00:00.000Z",
    updatedAt: "2026-09-05T00:00:00.000Z",
    client: { id: "cli_001", name: "Acme Corp" },
    transaction: null,
  });

  const result = await invoices.update("inv_001" as InvoiceId, {
    status: "sent",
    lineItems: [{ description: "Updated", quantity: 1, unitPrice: 600000 }],
    discountAmount: 10000,
  });

  expect(http.patch).toHaveBeenCalledWith("/api/invoices/inv_001", {
    status: "sent",
    lineItems: [{ description: "Updated", quantity: 1, unitPrice: 600000 }],
    discountAmount: 10000,
  });
  expect(result.status).toBe("sent");
});

test("invoices.delete - removes invoice", async () => {
  (http.delete as ReturnType<typeof mock>).mockResolvedValue({ success: true });

  const result = await invoices.delete("inv_001" as InvoiceId);

  expect(http.delete).toHaveBeenCalledWith("/api/invoices/inv_001");
  expect(result.success).toBe(true);
});

test("invoices.getPublic - fetches by public token without auth", async () => {
  (http.get as ReturnType<typeof mock>).mockResolvedValue({
    id: "inv_pub",
    invoiceNumber: "INV-2026-PUB",
    status: "sent",
    issuedAt: "2026-09-05T00:00:00.000Z",
    dueAt: "2026-09-12T00:00:00.000Z",
    paidAt: null,
    subtotal: 100000,
    taxRate: 11,
    taxAmount: 11000,
    discountAmount: 0,
    total: 111000,
    currency: "IDR",
    lineItems: [{ description: "Service", quantity: 1, unitPrice: 100000, amount: 100000 }],
    notes: "Thank you",
    paymentTerms: "Net 7 days",
    billingAddress: "123 Main St",
    shippingAddress: null,
    clientName: "Acme Corp",
    clientDescription: "Enterprise",
    createdAt: "2026-09-05T00:00:00.000Z",
  });

  const result = await invoices.getPublic("tok_abc123");

  expect(http.get).toHaveBeenCalledWith("/api/invoices/public/tok_abc123");
  expect(result.clientName).toBe("Acme Corp");
  expect(result.total).toBe(111000);
});
