import { writable } from "svelte/store";
import { gt } from "../../../l10n/l10n";

export interface MessageBoxQuestion {
  title: string;
  message: string;
  okLabel: string;
  cancelLabel: string;
  answer: (ok: boolean) => void;
}

export const messageBoxQuestion = writable<MessageBoxQuestion | null>(null);

let pendingQuestion: MessageBoxQuestion | null = null;

export function showMessageBox(title: string, message: string, okLabel = gt`OK *=> Confirm and close the dialog`, cancelLabel = gt`Cancel *=> Close the dialog without making changes`): Promise<boolean> {
  pendingQuestion?.answer(false);
  return new Promise(resolve => {
    let question: MessageBoxQuestion = {
      title,
      message,
      okLabel,
      cancelLabel,
      answer: ok => {
        if (pendingQuestion != question) {
          return;
        }
        pendingQuestion = null;
        messageBoxQuestion.set(null);
        resolve(ok);
      },
    };
    pendingQuestion = question;
    messageBoxQuestion.set(question);
  });
}

export function askYesNo(title: string, message: string): Promise<boolean> {
  return showMessageBox(title, message, gt`Yes *=> Agree to the question in the dialog`, gt`No *=> Disagree with the question in the dialog`);
}
