import type {
  Gateway,
  PaymentMethod,
  TransactionId,
  TransactionStatus,
  PaginationResponse,
} from "./common";

export interface TransactionClient {
  id: string;
  name: string;
}

export interface TransactionInvoice {
  id: string;
  invoiceNumber: string;
}

export interface TransactionResponse {
  id: TransactionId;
  referenceId: string;
  gateway: Gateway;
  amount: number;
  currency: string;
  status: TransactionStatus;
  paymentMethod: PaymentMethod;
  description: string | null;
  createdAt: string;
  client: TransactionClient | null;
  invoice: TransactionInvoice | null;
}

export interface TransactionStatSum {
  amount: number;
}

export interface TransactionStat {
  status: TransactionStatus;
  _count: number;
  _sum: TransactionStatSum;
}

export interface ListTransactionsParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: TransactionStatus;
  gateway?: Gateway;
  clientId?: string;
  paymentMethod?: PaymentMethod;
  sortBy?: string;
  sortDir?: "asc" | "desc";
}

export interface ListTransactionsResponse {
  transactions: TransactionResponse[];
  pagination: PaginationResponse;
  stats: TransactionStat[];
}

export interface ChargeResponse {
  transactionId: TransactionId;
  status: TransactionStatus;
  gatewayCode: string | null;
  gatewayMessage: string | null;
}
