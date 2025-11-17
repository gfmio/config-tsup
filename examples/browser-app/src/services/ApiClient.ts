export class ApiClient {
  constructor(private baseUrl: string) {}

  async get(endpoint: string) {
    return fetch(`${this.baseUrl}${endpoint}`).then(r => r.json());
  }
}