import type { HttpClient } from "../core/http-client";
import type { ListLogsParams, ListLogsResponse } from "../types/logs";

export class LogsResource {
  constructor(private readonly http: HttpClient) {}

  async list(params?: ListLogsParams): Promise<ListLogsResponse> {
    return this.http.get<ListLogsResponse>("/api/logs", {
      params: params as Record<string, string | number | undefined>,
    });
  }
}
