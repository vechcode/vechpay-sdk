export const Gateway = {
  Stripe: "stripe",
  Xendit: "xendit",
  Midtrans: "midtrans",
  Doku: "doku",
} as const;
export type Gateway = (typeof Gateway)[keyof typeof Gateway];

export const PaymentMethod = {
  Card: "card",
  Ewallet: "ewallet",
  BankTransfer: "bank_transfer",
  Qris: "qris",
  Va: "va",
} as const;
export type PaymentMethod = (typeof PaymentMethod)[keyof typeof PaymentMethod];

export const TransactionStatus = {
  Pending: "PENDING",
  Success: "SUCCESS",
  Failed: "FAILED",
  Expired: "EXPIRED",
} as const;
export type TransactionStatus =
  (typeof TransactionStatus)[keyof typeof TransactionStatus];

export const InvoiceStatus = {
  Draft: "draft",
  Sent: "sent",
  Viewed: "viewed",
  Paid: "paid",
  Overdue: "overdue",
  Cancelled: "cancelled",
} as const;
export type InvoiceStatus = (typeof InvoiceStatus)[keyof typeof InvoiceStatus];

export const ClientEnvironment = {
  Sandbox: "sandbox",
  Production: "production",
} as const;
export type ClientEnvironment =
  (typeof ClientEnvironment)[keyof typeof ClientEnvironment];

export const ApiKeyStatus = {
  Active: "active",
  Revoked: "revoked",
} as const;
export type ApiKeyStatus = (typeof ApiKeyStatus)[keyof typeof ApiKeyStatus];

export const LogLevel = {
  Info: "info",
  Warn: "warn",
  Error: "error",
  Debug: "debug",
} as const;
export type LogLevel = (typeof LogLevel)[keyof typeof LogLevel];

export const ErrorCode = {
  AuthFailed: "AUTH_FAILED",
  ValidationError: "VALIDATION_ERROR",
  GatewayUnavailable: "GATEWAY_UNAVAILABLE",
  GatewayForbidden: "GATEWAY_FORBIDDEN",
  DuplicateReference: "DUPLICATE_REFERENCE",
  NotFound: "NOT_FOUND",
  TotpNotConfigured: "TOTP_NOT_CONFIGURED",
  InvalidEmail: "INVALID_EMAIL",
  InvalidTotp: "INVALID_TOTP",
} as const;
export type ErrorCode = (typeof ErrorCode)[keyof typeof ErrorCode];

export type TransactionId = string & { readonly __brand: "TransactionId" };
export type ClientId = string & { readonly __brand: "ClientId" };
export type ApiKeyId = string & { readonly __brand: "ApiKeyId" };
export type GatewayId = string & { readonly __brand: "GatewayId" };
export type InvoiceId = string & { readonly __brand: "InvoiceId" };
export type UserId = string & { readonly __brand: "UserId" };
export type LogId = string & { readonly __brand: "LogId" };

export interface PaginationParams {
  page?: number;
  limit?: number;
  search?: string;
}

export interface PaginationResponse {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface VechPayErrorResponse {
  error: string;
  code: ErrorCode;
  details?: Record<string, string[]>;
}

export interface VechPayConfig {
  baseUrl?: string;
  apiKey?: string;
  timeout?: number;
  retries?: number;
  retryDelay?: number;
  useSessionAuth?: boolean;
}

export interface RequestOptions {
  headers?: Record<string, string>;
  params?: Record<string, string | number | undefined>;
}
