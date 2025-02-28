export class Client {
  siteURL: URL;
  APIKey: string;
  project: string;
  component: string;
  constructor(siteURL: string, APIKey: string, project: string, component: string) {
    this.siteURL = new URL(siteURL);
    this.APIKey = APIKey;
    this.project = project;
    this.component = component;
  }

  async get(category: string, operation?: string, data?: any): Promise<Response> {
    return await this.request("GET", this.builtURL(category, operation), data);
  }

  async post(category: string, operation: string, data: any): Promise<Response> {
    return await this.request("POST", this.builtURL(category, operation), data);
  }

  async request(method: string, url: string, data?: any): Promise<Response> {
    let request = await fetch(url, {
      headers: {
        Authorization: `Bearer ${this.APIKey}`,
      },
      method,
      body: data,
    });
    return request;
  }

  builtURL(category: string, operation?: string): string {
    let url = new URL(`${this.siteURL}api/${category}/${this.project}/${this.component}/${operation}`);
    return url.toString();
  }
}