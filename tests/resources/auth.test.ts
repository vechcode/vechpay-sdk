import { test, expect, mock, beforeEach } from "bun:test";
import { AuthResource } from "../../src/resources/auth";
import type { HttpClient } from "../../src/core/http-client";

function createMockHttpClient() {
  return {
    get: mock(() => Promise.resolve({})),
    post: mock(() => Promise.resolve({})),
    patch: mock(() => Promise.resolve({})),
    put: mock(() => Promise.resolve({})),
    delete: mock(() => Promise.resolve({})),
    setSessionCookie: mock(() => {}),
    getSessionCookie: mock(() => null),
    getLastSetCookie: mock(() => "session=abc123"),
    request: mock(() => Promise.resolve({})),
  } as unknown as HttpClient;
}

let http: ReturnType<typeof createMockHttpClient>;
let auth: AuthResource;

beforeEach(() => {
  http = createMockHttpClient();
  auth = new AuthResource(http);
});

test("auth.login - step 1 returns totp_required", async () => {
  const mockResponse = {
    step: "totp_required",
    user: { email: "admin@example.com", name: "Admin" },
  };
  (http.request as ReturnType<typeof mock>).mockResolvedValue(mockResponse);

  const result = await auth.login({ email: "admin@example.com" });

  expect(http.request).toHaveBeenCalledWith("POST", "/api/auth/login", {
    body: { email: "admin@example.com" },
  });
  expect(result.step).toBe("totp_required");
  if ("user" in result) {
    expect(result.user.email).toBe("admin@example.com");
  }
});

test("auth.login - step 2 with TOTP returns success", async () => {
  const mockResponse = {
    success: true,
    user: {
      id: "usr_001",
      email: "admin@example.com",
      name: "Admin",
      role: "admin",
      createdAt: "2026-01-01T00:00:00.000Z",
    },
  };
  (http.request as ReturnType<typeof mock>).mockResolvedValue(mockResponse);

  const result = await auth.login({
    email: "admin@example.com",
    totpCode: "123456",
  });

  expect("success" in result && result.success).toBe(true);
  if ("user" in result) {
    expect(result.user.role).toBe("admin");
  }
  expect(http.setSessionCookie).toHaveBeenCalledWith("session=abc123");
});

test("auth.login - step 1 does not set session cookie", async () => {
  const mockResponse = {
    step: "totp_required",
    user: { email: "admin@example.com", name: "Admin" },
  };
  (http.request as ReturnType<typeof mock>).mockResolvedValue(mockResponse);

  await auth.login({ email: "admin@example.com" });

  expect(http.setSessionCookie).not.toHaveBeenCalled();
});

test("auth.logout - clears session cookie", async () => {
  (http.post as ReturnType<typeof mock>).mockResolvedValue({ success: true });

  const result = await auth.logout();

  expect(http.post).toHaveBeenCalledWith("/api/auth/logout");
  expect(http.setSessionCookie).toHaveBeenCalledWith(null);
  expect(result.success).toBe(true);
});

test("auth.getProfile - returns user profile", async () => {
  const mockResponse = {
    id: "usr_001",
    email: "admin@example.com",
    name: "Admin",
    role: "admin",
    createdAt: "2026-01-01T00:00:00.000Z",
  };
  (http.get as ReturnType<typeof mock>).mockResolvedValue(mockResponse);

  const result = await auth.getProfile();

  expect(http.get).toHaveBeenCalledWith("/api/auth/profile");
  expect(result.email).toBe("admin@example.com");
  expect(result.role).toBe("admin");
});

test("auth.updateProfile - patches profile fields", async () => {
  const mockResponse = {
    id: "usr_001",
    email: "new@example.com",
    name: "New Name",
    role: "admin",
    createdAt: "2026-01-01T00:00:00.000Z",
  };
  (http.patch as ReturnType<typeof mock>).mockResolvedValue(mockResponse);

  const result = await auth.updateProfile({
    name: "New Name",
    email: "new@example.com",
  });

  expect(http.patch).toHaveBeenCalledWith("/api/auth/profile", {
    name: "New Name",
    email: "new@example.com",
  });
  expect(result.name).toBe("New Name");
});

test("auth.resetTotp - returns QR code data", async () => {
  const mockResponse = {
    qrDataUrl: "data:image/png;base64,abc123",
    secret: "JBSWY3DPEHPK3PXP",
    uri: "otpauth://totp/VechPay:admin@example.com?secret=JBSWY3DPEHPK3PXP",
  };
  (http.post as ReturnType<typeof mock>).mockResolvedValue(mockResponse);

  const result = await auth.resetTotp();

  expect(http.post).toHaveBeenCalledWith("/api/auth/totp/reset");
  expect(result.secret).toBe("JBSWY3DPEHPK3PXP");
  expect(result.qrDataUrl).toContain("data:image/png;base64");
});

test("auth.confirmTotp - confirms TOTP setup", async () => {
  (http.post as ReturnType<typeof mock>).mockResolvedValue({ success: true });

  const result = await auth.confirmTotp({
    secret: "JBSWY3DPEHPK3PXP",
    totpCode: "123456",
  });

  expect(http.post).toHaveBeenCalledWith("/api/auth/totp/confirm", {
    secret: "JBSWY3DPEHPK3PXP",
    totpCode: "123456",
  });
  expect(result.success).toBe(true);
});

test("auth.me - returns current user from session", async () => {
  const mockResponse = {
    user: {
      id: "usr_001",
      email: "admin@example.com",
      name: "Admin",
      role: "admin",
      createdAt: "2026-01-01T00:00:00.000Z",
    },
  };
  (http.get as ReturnType<typeof mock>).mockResolvedValue(mockResponse);

  const result = await auth.me();

  expect(http.get).toHaveBeenCalledWith("/api/me");
  expect(result.user.id).toBe("usr_001");
});
