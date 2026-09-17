import type { LogLevel, LogId, PaginationResponse } from "./common";

export interface LogEntry {
  id: LogId;
  level: LogLevel;
  category: string;
  message: string;
  details: string | null;
  createdAt: string;
}

export interface ListLogsParams {
  page?: number;
  limit?: number;
  search?: string;
  level?: LogLevel;
  category?: string;
}

export interface ListLogsResponse {
  logs: LogEntry[];
  pagination: PaginationResponse;
}
