import type { HttpClient } from "../core/http-client";
import type {
  CreatePaymentRequest,
  CreatePaymentResponse,
  GetPaymentResponse,
} from "../types/payments";
import type { TransactionId } from "../types/common";

export class PaymentsResource {
  constructor(private readonly http: HttpClient) {}

  async create(
    data: CreatePaymentRequest,
    webhookUrl?: string,
  ): Promise<CreatePaymentResponse> {
    const headers: Record<string, string> = {};
    if (webhookUrl) {
      headers["X-WEBHOOK-URL"] = webhookUrl;
    }
    return this.http.post<CreatePaymentResponse>("/api/payments", data, {
      headers,
    });
  }

  async get(transactionId: TransactionId): Promise<GetPaymentResponse> {
    return this.http.get<GetPaymentResponse>(
      `/api/payments/${transactionId}`,
    );
  }
}
