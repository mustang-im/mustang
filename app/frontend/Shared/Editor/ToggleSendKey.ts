import { Extension } from "@tiptap/core";

export interface ToggleSendKeyOptions {
  /** `Enter` | `Ctrl-Enter` */
  sendKey: string;
  keyOptions: string[];
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    toggleSendKey: {
      /**
       * Toggle send key between `Ctrl-Enter` or `Enter`
       */
      toggleSendKey: () => ReturnType,
      /**
       * Emit `send` event
       */
      send: () => ReturnType,
    }
  }
}

/** Extension for emitting `send` event from `Ctrl-Enter` or 
 * `Enter`. 
 */
export const ToggleSendKey = Extension.create<ToggleSendKeyOptions>({
  name: 'toggle-send-key',
  addOptions() {
    return {
      sendKey: 'Ctrl-Enter',
      keyOptions: [
        'Ctrl-Enter',
        'Enter'
      ],
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
        let keyOptions = this.options.keyOptions;
        if (!sendKey || !keyOptions.includes(sendKey)) {
          this.options.sendKey = 'Ctrl-Enter';
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
      send: () => ({view}) =>  {
        const SendEvent = new Event('send');
        return view.dom.parentNode.dispatchEvent(SendEvent);
      }
    }
  },
});