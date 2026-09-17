import type { HttpClient } from "../core/http-client";
import type {
  GatewayCredentialResponse,
  CreateGatewayRequest,
  UpdateGatewayRequest,
  ListGatewaysParams,
} from "../types/gateways";
import type { GatewayId, Gateway } from "../types/common";

export class GatewaysResource {
  constructor(private readonly http: HttpClient) {}

  async list(params?: ListGatewaysParams): Promise<GatewayCredentialResponse[]> {
    return this.http.get<GatewayCredentialResponse[]>("/api/gateways", {
      params,
    });
  }

  async create(data: CreateGatewayRequest): Promise<GatewayCredentialResponse> {
    return this.http.post<GatewayCredentialResponse>("/api/gateways", data);
  }

  async update(
    id: GatewayId,
    data: UpdateGatewayRequest,
  ): Promise<GatewayCredentialResponse> {
    return this.http.patch<GatewayCredentialResponse>(
      `/api/gateways/${id}`,
      data,
    );
  }

  async delete(id: GatewayId): Promise<{ success: true }> {
    return this.http.delete<{ success: true }>(`/api/gateways/${id}`);
  }
}
