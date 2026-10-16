import { writable, type Writable } from "svelte/store";
import { gt } from "../../../l10n/l10n";

export interface MessageBoxQuestion {
  title: string;
  message: string;
  okLabel: string;
  cancelLabel: string;
  answer: (ok: boolean) => void;
}

export class MessageBox {
  static readonly current: Writable<MessageBoxQuestion | null> = writable(null);
  protected static pending: MessageBoxQuestion | null = null;

  static confirm(title: string, message: string, okLabel = gt`OK`, cancelLabel = gt`Cancel`): Promise<boolean> {
    MessageBox.pending?.answer(false);
    return new Promise(resolve => {
      let question: MessageBoxQuestion = {
        title,
        message,
        okLabel,
        cancelLabel,
        answer: ok => {
          if (MessageBox.pending != question) {
            return;
          }
          MessageBox.pending = null;
          MessageBox.current.set(null);
          resolve(ok);
        },
      };
      MessageBox.pending = question;
      MessageBox.current.set(question);
    });
  }

  static ask(title: string, message: string): Promise<boolean> {
    return MessageBox.confirm(title, message, gt`Yes`, gt`No`);
  }
}
