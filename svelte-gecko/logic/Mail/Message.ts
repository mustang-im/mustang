import { Message } from "../Abstract/Message";

export class EMail extends Message {
  authorEmailAddress: string;
  recipientEmailAddress: string;
  subject: string;
  contentType: string;
  _bodyPlaintext: string;
}
