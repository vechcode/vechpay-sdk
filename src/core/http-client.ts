import type { VechPayConfig, RequestOptions } from "../types/common";
import { VechPayError, createErrorFromResponse } from "./errors";
import { buildQueryString } from "../utils/query-builder";

const DEFAULT_BASE_URL = "https://pay.vechcode.com";
const DEFAULT_TIMEOUT = 30_000;
const DEFAULT_RETRIES = 0;
const DEFAULT_RETRY_DELAY = 1_000;

export class HttpClient {
  private readonly baseUrl: string;
  private readonly apiKey?: string;
  private readonly timeout: number;
  private readonly retries: number;
  private readonly retryDelay: number;
  private readonly useSessionAuth: boolean;
  private sessionCookie: string | null = null;
  private lastSetCookie: string | null = null;

  constructor(config: VechPayConfig) {
    this.baseUrl = (config.baseUrl ?? DEFAULT_BASE_URL).replace(/\/$/, "");
    this.apiKey = config.apiKey;
    this.timeout = config.timeout ?? DEFAULT_TIMEOUT;
    this.retries = config.retries ?? DEFAULT_RETRIES;
    this.retryDelay = config.retryDelay ?? DEFAULT_RETRY_DELAY;
    this.useSessionAuth = config.useSessionAuth ?? false;
  }

  setSessionCookie(cookie: string | null): void {
    this.sessionCookie = cookie;
  }

  getSessionCookie(): string | null {
    return this.sessionCookie;
  }

  getLastSetCookie(): string | null {
    return this.lastSetCookie;
  }

  private buildHeaders(
    extraHeaders?: Record<string, string>,
  ): Record<string, string> {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...extraHeaders,
    };

    if (this.apiKey && !this.useSessionAuth) {
      headers["X-API-KEY"] = this.apiKey;
    }

    if (this.useSessionAuth && this.sessionCookie) {
      headers["Cookie"] = this.sessionCookie;
    }

    return headers;
  }

  private async sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  private async fetchWithTimeout(
    url: string,
    init: RequestInit,
  ): Promise<Response> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      return await fetch(url, { ...init, signal: controller.signal });
    } finally {
      clearTimeout(timeoutId);
    }
  }

  async request<T>(
    method: string,
    path: string,
    options?: RequestOptions & { body?: unknown },
  ): Promise<T> {
    const queryString = buildQueryString(
      options?.params as Record<string, string | number | undefined>,
    );
    const url = `${this.baseUrl}${path}${queryString}`;
    const headers = this.buildHeaders(options?.headers);

    let lastError: Error | undefined;

    for (let attempt = 0; attempt <= this.retries; attempt++) {
      try {
        const response = await this.fetchWithTimeout(url, {
          method,
          headers,
          body: options?.body ? JSON.stringify(options.body) : undefined,
        });

        const text = await response.text();
        let body: unknown;
        try {
          body = text ? JSON.parse(text) : undefined;
        } catch {
          body = text;
        }

        const setCookie = response.headers.get("set-cookie");
        if (setCookie) {
          this.lastSetCookie = setCookie;
          if (this.useSessionAuth) {
            this.sessionCookie = setCookie;
          }
        }

        if (!response.ok) {
          throw createErrorFromResponse(response.status, body);
        }

        return body as T;
      } catch (error) {
        lastError = error as Error;

        if (error instanceof VechPayError) {
          throw error;
        }

        if (attempt < this.retries) {
          await this.sleep(this.retryDelay * 2 ** attempt);
          continue;
        }
      }
    }

    throw lastError;
  }

  get<T>(path: string, options?: RequestOptions): Promise<T> {
    return this.request<T>("GET", path, options);
  }

  post<T>(
    path: string,
    body?: unknown,
    options?: RequestOptions,
  ): Promise<T> {
    return this.request<T>("POST", path, { ...options, body });
  }

  patch<T>(
    path: string,
    body?: unknown,
    options?: RequestOptions,
  ): Promise<T> {
    return this.request<T>("PATCH", path, { ...options, body });
  }

  put<T>(
    path: string,
    body?: unknown,
    options?: RequestOptions,
  ): Promise<T> {
    return this.request<T>("PUT", path, { ...options, body });
  }

  delete<T>(path: string, options?: RequestOptions): Promise<T> {
    return this.request<T>("DELETE", path, options);
  }
}
