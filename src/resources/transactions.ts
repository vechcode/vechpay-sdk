import type { HttpClient } from "../core/http-client";
import type {
  TransactionResponse,
  ListTransactionsParams,
  ListTransactionsResponse,
  ChargeResponse,
} from "../types/transactions";
import type { TransactionId } from "../types/common";

export class TransactionsResource {
  constructor(private readonly http: HttpClient) {}

  async list(
    params?: ListTransactionsParams,
  ): Promise<ListTransactionsResponse> {
    return this.http.get<ListTransactionsResponse>("/api/transactions", {
      params: params as Record<string, string | number | undefined>,
    });
  }

  async delete(id: TransactionId): Promise<{ success: true }> {
    return this.http.delete<{ success: true }>(`/api/transactions/${id}`);
  }

  async charge(transactionId: TransactionId): Promise<ChargeResponse> {
    return this.http.get<ChargeResponse>(
      `/api/charge/${transactionId}`,
    );
  }
}
