export class OWAError extends Error {
  readonly type: string;
  constructor(response: any) {
    let message = response.message || `HTTP ${response.status} ${response.statusText}`;
    let type = `HTTP ${response.status}`
    if (response.json) {
      let body = response.json.Body || response.json;
      if (body.FaultMessage) {
        message = body.FaultMessage;
        type = body.ExceptionName;
      }
      if (body.ResponseMessages?.Items?.[0]) {
        body = body.ResponseMessages.Items[0];
      }
      if (body.MessageText) {
        message = body.MessageText;
        type = body.ResponseCode;
      }
    }
    super(message);
    this.type = type;
  }
}
