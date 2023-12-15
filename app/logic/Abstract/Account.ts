export class Account {
  id: string;
  name: string;
  userRealname: string;

  constructor() {
    this.id = crypto.randomUUID();
  }

  async login() {
  }
}
