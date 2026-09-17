import { HttpClient } from "../core/http-client";
import { PaymentsResource } from "../resources/payments";
import { InvoicesResource } from "../resources/invoices";
import type { VechPayConfig } from "../types/common";

export class VechPay {
  readonly payments: PaymentsResource;
  readonly invoices: InvoicesResource;

  private readonly http: HttpClient;

  constructor(config: VechPayConfig) {
    if (!config.apiKey) {
      throw new Error("apiKey is required for VechPay client");
    }

    this.http = new HttpClient(config);
    this.payments = new PaymentsResource(this.http);
    this.invoices = new InvoicesResource(this.http);
  }
}
