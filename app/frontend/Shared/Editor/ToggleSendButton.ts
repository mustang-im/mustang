import { Extension } from "@tiptap/core";

export interface ToggleOptions {
  /** `Enter` | `Ctrl-Enter` */
  sendButton: string;
  buttonOptions: string[];
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    toggleSendButton: {
      /**
       * Toggle send button
       */
      toggleSendButton: () => ReturnType,
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
export const ToggleSendButton = Extension.create<ToggleOptions>({
  name: 'toggle-send-button',
  addOptions() {
    return {
      sendButton: 'Ctrl-Enter',
      buttonOptions: [
        'Ctrl-Enter',
        'Enter'
      ],
    }
  },
  addKeyboardShortcuts() {
    return {
      Enter: ({editor}) => {
        if (this.options.sendButton === 'Enter') {
          return editor.commands.send();
        }
        return false;
      },
      'Ctrl-Enter': ({editor}) => {
        let sendButton = this.options.sendButton;
        let buttonOptions = this.options.buttonOptions;
        if (!sendButton || !buttonOptions.includes(sendButton)) {
          this.options.sendButton = 'Ctrl-Enter';
          return editor.commands.send();
        }
        if (sendButton === 'Ctrl-Enter') {
          return editor.commands.send();
        }
        return false;
      },
    }
  },
  addCommands() {
    return {
      toggleSendButton: () => () => {
        if (this.options.sendButton === 'Enter') {
          this.options.sendButton = 'Ctrl-Enter';
        } else {
          this.options.sendButton = 'Enter';
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