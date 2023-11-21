export class Account {
  id: string;
  name: string;

  constructor() {
    this.id = crypto.randomUUID();
  }

  async login() {
  }
}
