import type {
  ApiKeyId,
  ApiKeyStatus,
  ClientEnvironment,
  Gateway,
  PaginationResponse,
} from "./common";

export interface ApiKeyResponse {
  id: ApiKeyId;
  name: string;
  keyPrefix: string;
  status: ApiKeyStatus;
  gateways: Gateway[];
  environment: ClientEnvironment;
  clientName: string;
  lastUsedAt: string | null;
  createdAt: string;
}

export interface CreateApiKeyResponse extends ApiKeyResponse {
  key: string;
}

export interface ListApiKeysParams {
  page?: number;
  limit?: number;
  search?: string;
  clientId?: string;
  status?: ApiKeyStatus;
  environment?: ClientEnvironment;
}

export interface ListApiKeysResponse {
  keys: ApiKeyResponse[];
  pagination: PaginationResponse;
}

export interface CreateApiKeyRequest {
  clientId: string;
  name: string;
  gateways: Gateway[];
  environment?: ClientEnvironment;
}

export interface UpdateApiKeyRequest {
  name?: string;
  gateways?: Gateway[];
  status?: ApiKeyStatus;
}
