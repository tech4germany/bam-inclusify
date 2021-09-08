import { CheckRequestParameters, CheckResponse } from "./types";

export class LanguageToolClient {
  private readonly baseUrl: string;

  constructor(host: string = "", baseUri: string = "/v2") {
    this.baseUrl = `${host}${baseUri}`;
  }

  async check(parameters: CheckRequestParameters): Promise<CheckResponse> {
    const body = Object.entries(parameters)
      .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v as any)}`)
      .join("&");
    const r = await fetch(`${this.baseUrl}/check`, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body,
    });
    const content = await r.json();
    return content;
  }
}
