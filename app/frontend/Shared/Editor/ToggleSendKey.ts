import { Extension } from "@tiptap/core";

export interface ToggleSendKeyOptions {
  /** `Enter` | `Ctrl-Enter` */
  sendKey: string;
  /** Callback for sending */
  sendFunc: Function;
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    toggleSendKey: {
      /**
       * Toggle send key between `Ctrl-Enter` or `Enter`
       */
      toggleSendKey: () => ReturnType,
      /**
       * Call callback for sending
       */
      send: () => ReturnType,
    }
  }
}

/** Extension for calling a callback on `Ctrl-Enter` or `Enter`
 * to send message.
 */
export const ToggleSendKey = Extension.create<ToggleSendKeyOptions>({
  name: 'toggle-send-key',
  addOptions() {
    return {
      sendKey: 'Ctrl-Enter',
      sendFunc: null,
    }
  },
  addKeyboardShortcuts() {
    return {
      Enter: ({editor}) => {
        if (this.options.sendKey === 'Enter') {
          return editor.commands.send();
        }
        return false;
      },
      'Ctrl-Enter': ({editor}) => {
        let sendKey = this.options.sendKey;
        if (!sendKey || sendKey !== 'Enter' && sendKey !== 'Ctrl-Enter') {
          sendKey = 'Ctrl-Enter';
          return editor.commands.send();
        }
        if (sendKey === 'Ctrl-Enter') {
          return editor.commands.send();
        }
        return false;
      },
    }
  },
  addCommands() {
    return {
      toggleSendKey: () => () => {
        if (this.options.sendKey === 'Enter') {
          this.options.sendKey = 'Ctrl-Enter';
        } else {
          this.options.sendKey = 'Enter';
        }
        return true;
      },
      send: () => () =>  {
        if (typeof(this.options.sendFunc) == "function") {
          this.options.sendFunc();
          return true;
        }
        return false;
      }
    }
  },
});