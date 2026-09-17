import type {
  Gateway,
  PaymentMethod,
  TransactionId,
  TransactionStatus,
} from "./common";

export interface CreatePaymentRequest {
  amount: number;
  currency?: string;
  referenceId: string;
  description?: string;
  paymentMethod?: PaymentMethod;
  gateway?: Gateway;
  metadata?: Record<string, string>;
  returnUrl?: string;
  cancelUrl?: string;
  webhookUrl?: string;
}

export interface CreatePaymentResponse {
  transactionId: TransactionId;
  referenceId: string;
  gateway: Gateway;
  status: TransactionStatus;
  amount: number;
  currency: string;
}

export interface GetPaymentResponse {
  transactionId: TransactionId;
  referenceId: string;
  gateway: Gateway;
  status: TransactionStatus;
  amount: number;
  currency: string;
  paymentMethod: PaymentMethod;
  description: string | null;
  gatewayCode: string | null;
  gatewayMessage: string | null;
  redirectUrl: string | null;
  createdAt: string;
  updatedAt: string;
}
