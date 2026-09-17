import { test, expect } from "bun:test";
import type {
  CreatePaymentRequest,
  CreatePaymentResponse,
  GetPaymentResponse,
} from "../../src/types/payments";
import type {
  InvoiceResponse,
  InvoicePublicResponse,
  CreateInvoiceRequest,
  ListInvoicesResponse,
  UpdateInvoiceRequest,
} from "../../src/types/invoices";
import type {
  ClientResponse,
  ListClientsResponse,
  CreateClientRequest,
} from "../../src/types/clients";
import type {
  ApiKeyResponse,
  CreateApiKeyResponse,
  ListApiKeysResponse,
  CreateApiKeyRequest,
} from "../../src/types/api-keys";
import type {
  GatewayCredentialResponse,
  CreateGatewayRequest,
} from "../../src/types/gateways";
import type {
  TransactionResponse,
  ListTransactionsResponse,
  ChargeResponse,
} from "../../src/types/transactions";
import type {
  LoginResponse,
  AuthUser,
  TotpResetResponse,
  MeResponse,
} from "../../src/types/auth";
import type { DashboardStats } from "../../src/types/dashboard";
import type { SettingsMap, UpdateSettingsRequest } from "../../src/types/settings";
import type { ListLogsResponse } from "../../src/types/logs";
import type {
  Gateway,
  PaymentMethod,
  TransactionStatus,
  InvoiceStatus,
  ClientEnvironment,
  ApiKeyStatus,
  LogLevel,
  ErrorCode,
  TransactionId,
  ClientId,
  ApiKeyId,
  GatewayId,
  InvoiceId,
  PaginationResponse,
  VechPayErrorResponse,
} from "../../src/types/common";

test("type exports - all enums are accessible", () => {
  const gateway: Gateway = "stripe";
  const method: PaymentMethod = "card";
  const status: TransactionStatus = "SUCCESS";
  const invoiceStatus: InvoiceStatus = "paid";
  const env: ClientEnvironment = "sandbox";
  const keyStatus: ApiKeyStatus = "active";
  const logLevel: LogLevel = "info";
  const errCode: ErrorCode = "AUTH_FAILED";

  expect(gateway).toBe("stripe");
  expect(method).toBe("card");
  expect(status).toBe("SUCCESS");
  expect(invoiceStatus).toBe("paid");
  expect(env).toBe("sandbox");
  expect(keyStatus).toBe("active");
  expect(logLevel).toBe("info");
  expect(errCode).toBe("AUTH_FAILED");
});

test("type exports - branded types are strings", () => {
  const txnId: TransactionId = "clt_123" as TransactionId;
  const clientId: ClientId = "cli_123" as ClientId;
  const keyId: ApiKeyId = "ak_123" as ApiKeyId;
  const gwId: GatewayId = "gw_123" as GatewayId;
  const invId: InvoiceId = "inv_123" as InvoiceId;

  expect(typeof txnId).toBe("string");
  expect(typeof clientId).toBe("string");
  expect(typeof keyId).toBe("string");
  expect(typeof gwId).toBe("string");
  expect(typeof invId).toBe("string");
});

test("type exports - pagination response has correct shape", () => {
  const pagination: PaginationResponse = {
    page: 1,
    limit: 25,
    total: 100,
    totalPages: 4,
  };

  expect(pagination.page).toBe(1);
  expect(pagination.totalPages).toBe(4);
});

test("type exports - error response has correct shape", () => {
  const error: VechPayErrorResponse = {
    error: "Not found",
    code: "NOT_FOUND",
    details: { id: ["Invalid ID"] },
  };

  expect(error.code).toBe("NOT_FOUND");
  expect(error.details?.id).toEqual(["Invalid ID"]);
});

test("type exports - payment request type compiles", () => {
  const req: CreatePaymentRequest = {
    amount: 100000,
    referenceId: "ORDER-001",
    gateway: "stripe",
    paymentMethod: "card",
    currency: "IDR",
    metadata: { orderId: "123" },
  };

  expect(req.amount).toBe(100000);
});

test("type exports - invoice request type compiles", () => {
  const req: CreateInvoiceRequest = {
    clientId: "cli_001",
    gateway: "stripe",
    lineItems: [{ description: "Service", unitPrice: 100000 }],
    taxRate: 11,
  };

  expect(req.lineItems).toHaveLength(1);
});

test("type exports - client request type compiles", () => {
  const req: CreateClientRequest = {
    name: "Acme Corp",
    description: "Enterprise",
    environment: "sandbox",
  };

  expect(req.name).toBe("Acme Corp");
});

test("type exports - API key request type compiles", () => {
  const req: CreateApiKeyRequest = {
    clientId: "cli_001",
    name: "Production Key",
    gateways: ["stripe", "xendit"],
    environment: "production",
  };

  expect(req.gateways).toHaveLength(2);
});

test("type exports - gateway request type compiles", () => {
  const req: CreateGatewayRequest = {
    name: "Stripe Prod",
    gateway: "stripe",
    environment: "production",
    credentials: { secretKey: "sk_live_xxx" },
  };

  expect(req.credentials.secretKey).toBe("sk_live_xxx");
});

test("type exports - settings update type compiles", () => {
  const req: UpdateSettingsRequest = {
    settings: [
      { key: "app_name", value: "VechPay", group: "general" },
    ],
  };

  expect(req.settings).toHaveLength(1);
});
