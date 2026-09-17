import type { HttpClient } from "../core/http-client";
import type { DashboardStats } from "../types/dashboard";

export class DashboardResource {
  constructor(private readonly http: HttpClient) {}

  async getStats(): Promise<DashboardStats> {
    return this.http.get<DashboardStats>("/api/dashboard");
  }
}
