import type { HttpClient } from "../core/http-client";
import type {
  CreateInvoiceRequest,
  InvoiceResponse,
  InvoicePublicResponse,
  ListInvoicesParams,
  ListInvoicesResponse,
  UpdateInvoiceRequest,
} from "../types/invoices";
import type { InvoiceId } from "../types/common";

export class InvoicesResource {
  constructor(private readonly http: HttpClient) {}

  async list(params?: ListInvoicesParams): Promise<ListInvoicesResponse> {
    return this.http.get<ListInvoicesResponse>("/api/invoices", {
      params: params as Record<string, string | number | undefined>,
    });
  }

  async create(data: CreateInvoiceRequest): Promise<InvoiceResponse> {
    return this.http.post<InvoiceResponse>("/api/invoices", data);
  }

  async get(id: InvoiceId): Promise<InvoiceResponse> {
    return this.http.get<InvoiceResponse>(`/api/invoices/${id}`);
  }

  async update(
    id: InvoiceId,
    data: UpdateInvoiceRequest,
  ): Promise<InvoiceResponse> {
    return this.http.patch<InvoiceResponse>(`/api/invoices/${id}`, data);
  }

  async delete(id: InvoiceId): Promise<{ success: true }> {
    return this.http.delete<{ success: true }>(`/api/invoices/${id}`);
  }

  async getPublic(token: string): Promise<InvoicePublicResponse> {
    return this.http.get<InvoicePublicResponse>(
      `/api/invoices/public/${token}`,
    );
  }
}
