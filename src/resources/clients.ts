import type { HttpClient } from "../core/http-client";
import type {
  ClientResponse,
  ListClientsParams,
  ListClientsResponse,
  CreateClientRequest,
  UpdateClientRequest,
} from "../types/clients";
import type { ClientId } from "../types/common";

export class ClientsResource {
  constructor(private readonly http: HttpClient) {}

  async list(params?: ListClientsParams): Promise<ListClientsResponse> {
    return this.http.get<ListClientsResponse>("/api/clients", {
      params,
    });
  }

  async create(data: CreateClientRequest): Promise<ClientResponse> {
    return this.http.post<ClientResponse>("/api/clients", data);
  }

  async update(
    id: ClientId,
    data: UpdateClientRequest,
  ): Promise<ClientResponse> {
    return this.http.patch<ClientResponse>(`/api/clients/${id}`, data);
  }

  async delete(id: ClientId): Promise<{ success: true }> {
    return this.http.delete<{ success: true }>(`/api/clients/${id}`);
  }
}
