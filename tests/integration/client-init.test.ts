import { test, expect } from "bun:test";
import { VechPay } from "../../src/clients/vechpay-client";
import { VechPayAdmin } from "../../src/clients/vechpay-admin";
import { VechPayError } from "../../src/core/errors";

test("VechPay - initializes with API key", () => {
  const sdk = new VechPay({ apiKey: "vk_test_key" });

  expect(sdk.payments).toBeDefined();
  expect(sdk.invoices).toBeDefined();
});

test("VechPay - throws without API key", () => {
  expect(() => new VechPay({})).toThrow("apiKey is required");
});

test("VechPay - has correct resource types", () => {
  const sdk = new VechPay({ apiKey: "vk_test" });

  expect(typeof sdk.payments.create).toBe("function");
  expect(typeof sdk.payments.get).toBe("function");
  expect(typeof sdk.invoices.list).toBe("function");
  expect(typeof sdk.invoices.create).toBe("function");
  expect(typeof sdk.invoices.get).toBe("function");
  expect(typeof sdk.invoices.update).toBe("function");
  expect(typeof sdk.invoices.delete).toBe("function");
  expect(typeof sdk.invoices.getPublic).toBe("function");
});

test("VechPayAdmin - initializes without API key", () => {
  const admin = new VechPayAdmin();

  expect(admin.auth).toBeDefined();
  expect(admin.clients).toBeDefined();
  expect(admin.apiKeys).toBeDefined();
  expect(admin.gateways).toBeDefined();
  expect(admin.transactions).toBeDefined();
  expect(admin.invoices).toBeDefined();
  expect(admin.dashboard).toBeDefined();
  expect(admin.settings).toBeDefined();
  expect(admin.logs).toBeDefined();
});

test("VechPayAdmin - has all resource methods", () => {
  const admin = new VechPayAdmin();

  expect(typeof admin.auth.login).toBe("function");
  expect(typeof admin.auth.logout).toBe("function");
  expect(typeof admin.auth.getProfile).toBe("function");
  expect(typeof admin.auth.updateProfile).toBe("function");
  expect(typeof admin.auth.resetTotp).toBe("function");
  expect(typeof admin.auth.confirmTotp).toBe("function");
  expect(typeof admin.auth.me).toBe("function");

  expect(typeof admin.clients.list).toBe("function");
  expect(typeof admin.clients.create).toBe("function");
  expect(typeof admin.clients.update).toBe("function");
  expect(typeof admin.clients.delete).toBe("function");

  expect(typeof admin.apiKeys.list).toBe("function");
  expect(typeof admin.apiKeys.create).toBe("function");
  expect(typeof admin.apiKeys.update).toBe("function");
  expect(typeof admin.apiKeys.delete).toBe("function");

  expect(typeof admin.gateways.list).toBe("function");
  expect(typeof admin.gateways.create).toBe("function");
  expect(typeof admin.gateways.update).toBe("function");
  expect(typeof admin.gateways.delete).toBe("function");

  expect(typeof admin.transactions.list).toBe("function");
  expect(typeof admin.transactions.delete).toBe("function");
  expect(typeof admin.transactions.charge).toBe("function");

  expect(typeof admin.dashboard.getStats).toBe("function");
  expect(typeof admin.settings.get).toBe("function");
  expect(typeof admin.settings.update).toBe("function");
  expect(typeof admin.logs.list).toBe("function");
});

test("VechPayAdmin - manages session cookie", () => {
  const admin = new VechPayAdmin();

  expect(admin.getSessionCookie()).toBeNull();

  admin.setSessionCookie("session=abc123");
  expect(admin.getSessionCookie()).toBe("session=abc123");

  admin.setSessionCookie("");
  expect(admin.getSessionCookie()).toBe("");
});

test("VechPayAdmin - accepts custom config", () => {
  const admin = new VechPayAdmin({
    baseUrl: "https://custom.api.com",
    timeout: 5000,
    retries: 3,
  });

  expect(admin).toBeDefined();
  expect(admin.clients).toBeDefined();
});

test("VechPayError - is instance of Error", () => {
  const error = new VechPayError("test", "AUTH_FAILED", 401);
  expect(error).toBeInstanceOf(Error);
  expect(error).toBeInstanceOf(VechPayError);
  expect(error.name).toBe("VechPayError");
});
