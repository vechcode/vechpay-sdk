import type { HttpClient } from "../core/http-client";
import type {
  ApiKeyResponse,
  CreateApiKeyResponse,
  ListApiKeysParams,
  ListApiKeysResponse,
  CreateApiKeyRequest,
  UpdateApiKeyRequest,
} from "../types/api-keys";
import type { ApiKeyId } from "../types/common";

export class ApiKeysResource {
  constructor(private readonly http: HttpClient) {}

  async list(params?: ListApiKeysParams): Promise<ListApiKeysResponse> {
    return this.http.get<ListApiKeysResponse>("/api/api-keys", {
      params: params as Record<string, string | number | undefined>,
    });
  }

  async create(data: CreateApiKeyRequest): Promise<CreateApiKeyResponse> {
    return this.http.post<CreateApiKeyResponse>("/api/api-keys", data);
  }

  async update(
    id: ApiKeyId,
    data: UpdateApiKeyRequest,
  ): Promise<ApiKeyResponse> {
    return this.http.patch<ApiKeyResponse>(`/api/api-keys/${id}`, data);
  }

  async delete(id: ApiKeyId): Promise<{ success: true }> {
    return this.http.delete<{ success: true }>(`/api/api-keys/${id}`);
  }
}
