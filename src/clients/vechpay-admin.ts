import { HttpClient } from "../core/http-client";
import { AuthResource } from "../resources/auth";
import { ClientsResource } from "../resources/clients";
import { ApiKeysResource } from "../resources/api-keys";
import { GatewaysResource } from "../resources/gateways";
import { TransactionsResource } from "../resources/transactions";
import { InvoicesResource } from "../resources/invoices";
import { DashboardResource } from "../resources/dashboard";
import { SettingsResource } from "../resources/settings";
import { LogsResource } from "../resources/logs";
import type { VechPayConfig } from "../types/common";
import type { LoginResponse } from "../types/auth";

export class VechPayAdmin {
  readonly auth: AuthResource;
  readonly clients: ClientsResource;
  readonly apiKeys: ApiKeysResource;
  readonly gateways: GatewaysResource;
  readonly transactions: TransactionsResource;
  readonly invoices: InvoicesResource;
  readonly dashboard: DashboardResource;
  readonly settings: SettingsResource;
  readonly logs: LogsResource;

  private readonly http: HttpClient;

  constructor(config?: VechPayConfig) {
    this.http = new HttpClient({
      ...config,
      useSessionAuth: true,
    });

    this.auth = new AuthResource(this.http);
    this.clients = new ClientsResource(this.http);
    this.apiKeys = new ApiKeysResource(this.http);
    this.gateways = new GatewaysResource(this.http);
    this.transactions = new TransactionsResource(this.http);
    this.invoices = new InvoicesResource(this.http);
    this.dashboard = new DashboardResource(this.http);
    this.settings = new SettingsResource(this.http);
    this.logs = new LogsResource(this.http);
  }

  setSessionCookie(cookie: string): void {
    this.http.setSessionCookie(cookie);
  }

  getSessionCookie(): string | null {
    return this.http.getSessionCookie();
  }
}
