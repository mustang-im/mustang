import express from 'express';

export class HTTPServer {
  app: express;
  httpServer: any;
  async start(port: number) {
    this.app = new express();
    return new Promise((resolve, reject) => {
      this.httpServer = this.app.listen(port, resolve);
    });
  }
  get(path: string, callback: (url: string) => string) {
    this.app.get(path, (req, res) => {
      let responseHTML = callback(req?.url);
      res.send(responseHTML);
    });
  }
  close() {
    this.httpServer.close();
  }
}
