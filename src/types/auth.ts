import type { UserId } from "./common";

export interface AuthUser {
  id: UserId;
  email: string;
  name: string;
  role: string;
  createdAt: string;
}

export interface LoginStep1Response {
  step: "totp_required";
  user: Pick<AuthUser, "email" | "name">;
}

export interface LoginStep2Response {
  success: true;
  user: AuthUser;
}

export type LoginResponse = LoginStep1Response | LoginStep2Response;

export interface LoginRequest {
  email: string;
  totpCode?: string;
}

export interface UpdateProfileRequest {
  name?: string;
  email?: string;
}

export interface TotpResetResponse {
  qrDataUrl: string;
  secret: string;
  uri: string;
}

export interface TotpConfirmRequest {
  secret: string;
  totpCode: string;
}

export interface MeResponse {
  user: AuthUser;
}
