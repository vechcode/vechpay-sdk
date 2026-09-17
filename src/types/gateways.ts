import type {
  ClientEnvironment,
  Gateway,
  GatewayId,
} from "./common";

export interface GatewayCredentialResponse {
  id: GatewayId;
  name: string;
  gateway: Gateway;
  environment: ClientEnvironment;
  enabled: boolean;
  transactionCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateGatewayRequest {
  name: string;
  gateway: Gateway;
  environment?: ClientEnvironment;
  credentials: Record<string, string>;
}

export interface UpdateGatewayRequest {
  name?: string;
  credentials?: Record<string, string>;
  enabled?: boolean;
}

export interface ListGatewaysParams {
  gateway?: Gateway;
}
