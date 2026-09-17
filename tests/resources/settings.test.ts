import { test, expect, mock, beforeEach } from "bun:test";
import { SettingsResource } from "../../src/resources/settings";
import type { HttpClient } from "../../src/core/http-client";

function createMockHttpClient() {
  return {
    get: mock(() => Promise.resolve({})),
    post: mock(() => Promise.resolve({})),
    patch: mock(() => Promise.resolve({})),
    put: mock(() => Promise.resolve({})),
    delete: mock(() => Promise.resolve({})),
  } as unknown as HttpClient;
}

let http: ReturnType<typeof createMockHttpClient>;
let settings: SettingsResource;

beforeEach(() => {
  http = createMockHttpClient();
  settings = new SettingsResource(http);
});

test("settings.get - returns key-value pairs", async () => {
  const mockResponse = {
    app_name: "VechPay Gateway",
    support_email: "support@vechpay.com",
  };
  (http.get as ReturnType<typeof mock>).mockResolvedValue(mockResponse);

  const result = await settings.get();

  expect(http.get).toHaveBeenCalledWith("/api/settings");
  expect(result.app_name).toBe("VechPay Gateway");
  expect(result.support_email).toBe("support@vechpay.com");
});

test("settings.update - upserts settings", async () => {
  (http.put as ReturnType<typeof mock>).mockResolvedValue({ success: true });

  const result = await settings.update({
    settings: [
      { key: "app_name", value: "VechPay Gateway", group: "general" },
      { key: "support_email", value: "support@vechpay.com", group: "general" },
    ],
  });

  expect(http.put).toHaveBeenCalledWith("/api/settings", {
    settings: [
      { key: "app_name", value: "VechPay Gateway", group: "general" },
      { key: "support_email", value: "support@vechpay.com", group: "general" },
    ],
  });
  expect(result.success).toBe(true);
});
