import type {
  ClientEnvironment,
  Gateway,
  InvoiceId,
  InvoiceStatus,
  PaymentMethod,
  TransactionId,
  TransactionStatus,
} from "./common";

export interface InvoiceLineItem {
  description: string;
  quantity?: number;
  unitPrice: number;
  amount?: number;
}

export interface CreateInvoiceRequest {
  clientId: string;
  status?: InvoiceStatus;
  currency?: string;
  gateway: Gateway;
  paymentMethod?: PaymentMethod;
  lineItems: InvoiceLineItem[];
  taxRate?: number;
  discountAmount?: number;
  notes?: string;
  issuedAt?: string;
  dueAt?: string;
  billingAddress?: string;
  shippingAddress?: string | null;
}

export interface InvoiceClient {
  id: string;
  name: string;
}

export interface InvoiceTransaction {
  id: TransactionId;
  referenceId: string;
  status: TransactionStatus;
  expiresAt: string | null;
}

export interface InvoiceResponse {
  id: InvoiceId;
  invoiceNumber: string;
  status: InvoiceStatus;
  clientId: string;
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  discountAmount: number;
  total: number;
  currency: string;
  lineItems: InvoiceLineItem[];
  notes: string | null;
  issuedAt: string;
  dueAt: string | null;
  paidAt: string | null;
  createdAt: string;
  updatedAt: string;
  client: InvoiceClient;
  transaction: InvoiceTransaction | null;
}

export interface InvoicePublicResponse {
  id: InvoiceId;
  invoiceNumber: string;
  status: InvoiceStatus;
  issuedAt: string;
  dueAt: string | null;
  paidAt: string | null;
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  discountAmount: number;
  total: number;
  currency: string;
  lineItems: InvoiceLineItem[];
  notes: string | null;
  paymentTerms: string | null;
  billingAddress: string | null;
  shippingAddress: string | null;
  clientName: string;
  clientDescription: string | null;
  createdAt: string;
}

export interface ListInvoicesParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: InvoiceStatus;
  clientId?: string;
}

export interface InvoiceStats {
  draft: number;
  sent: number;
  viewed: number;
  paid: number;
  overdue: number;
  cancelled: number;
}

export interface ListInvoicesResponse {
  invoices: InvoiceResponse[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  stats: InvoiceStats;
}

export interface UpdateInvoiceRequest {
  clientId?: string;
  status?: InvoiceStatus;
  isSaved?: boolean;
  issuedAt?: string;
  dueAt?: string;
  currency?: string;
  lineItems?: InvoiceLineItem[];
  taxRate?: number;
  discountAmount?: number;
  notes?: string;
  paymentTerms?: string;
  billingAddress?: string;
  shippingAddress?: string | null;
}
