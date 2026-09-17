import type { HttpClient } from "../core/http-client";
import type {
  LoginRequest,
  LoginResponse,
  AuthUser,
  UpdateProfileRequest,
  TotpResetResponse,
  TotpConfirmRequest,
  MeResponse,
} from "../types/auth";

export class AuthResource {
  constructor(private readonly http: HttpClient) {}

  async login(data: LoginRequest): Promise<LoginResponse> {
    const response = await this.http.request<LoginResponse>(
      "POST",
      "/api/auth/login",
      { body: data },
    );

    if ("success" in response && response.success) {
      const setCookie = this.http.getLastSetCookie();
      if (setCookie) {
        this.http.setSessionCookie(setCookie);
      }
    }

    return response;
  }

  async logout(): Promise<{ success: true }> {
    const response = await this.http.post<{ success: true }>(
      "/api/auth/logout",
    );
    this.http.setSessionCookie(null);
    return response;
  }

  async getProfile(): Promise<AuthUser> {
    return this.http.get<AuthUser>("/api/auth/profile");
  }

  async updateProfile(data: UpdateProfileRequest): Promise<AuthUser> {
    return this.http.patch<AuthUser>("/api/auth/profile", data);
  }

  async resetTotp(): Promise<TotpResetResponse> {
    return this.http.post<TotpResetResponse>("/api/auth/totp/reset");
  }

  async confirmTotp(data: TotpConfirmRequest): Promise<{ success: true }> {
    return this.http.post<{ success: true }>("/api/auth/totp/confirm", data);
  }

  async me(): Promise<MeResponse> {
    return this.http.get<MeResponse>("/api/me");
  }
}
