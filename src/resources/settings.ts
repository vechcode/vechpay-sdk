import type { HttpClient } from "../core/http-client";
import type { SettingsMap, UpdateSettingsRequest } from "../types/settings";

export class SettingsResource {
  constructor(private readonly http: HttpClient) {}

  async get(): Promise<SettingsMap> {
    return this.http.get<SettingsMap>("/api/settings");
  }

  async update(data: UpdateSettingsRequest): Promise<{ success: true }> {
    return this.http.put<{ success: true }>("/api/settings", data);
  }
}
