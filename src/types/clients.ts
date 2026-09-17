import type { ClientEnvironment, ClientId, PaginationResponse } from "./common";

export interface ClientResponse {
  id: ClientId;
  name: string;
  description: string | null;
  environment: ClientEnvironment;
  active: boolean;
  apiKeyCount: number;
  transactionCount: number;
  createdAt: string;
}

export interface ListClientsParams {
  page?: number;
  limit?: number;
  search?: string;
  environment?: ClientEnvironment;
}

export interface ListClientsResponse {
  clients: ClientResponse[];
  pagination: PaginationResponse;
}

export interface CreateClientRequest {
  name: string;
  description?: string;
  environment?: ClientEnvironment;
}

export interface UpdateClientRequest {
  name?: string;
  description?: string;
  environment?: ClientEnvironment;
  active?: boolean;
}
