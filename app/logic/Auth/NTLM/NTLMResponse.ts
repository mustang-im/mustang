export interface NTLMRequestOptions {
  headers?: Record<string, string>;
  signal?: AbortSignal;
  onChunk?: (chunk: string) => Promise<void>;
}

/** Duck-typed like a `fetch()` `Response`, as far as `EWSAccount` needs it */
export class NTLMResponse {
  readonly status: number;
  readonly statusText: string;
  readonly ok: boolean;
  readonly socketID: number;
  readonly headers: { get: (name: string) => string | null };
  protected readonly bodyText: string;

  constructor(response: any) {
    this.status = response.status;
    this.statusText = response.statusText;
    this.ok = response.ok;
    this.socketID = response.socketID;
    this.bodyText = response.body;
    let rawHeaders = response.headers;
    this.headers = {
      get: (name: string) => joinHeader(rawHeaders[name.toLowerCase()]) || null,
    };
  }

  async text(): Promise<string> {
    return this.bodyText;
  }
}

/** node gives repeated HTTP headers as an array */
export function joinHeader(value: string | string[] | undefined): string {
  return Array.isArray(value) ? value.join(", ") : value ?? "";
}
