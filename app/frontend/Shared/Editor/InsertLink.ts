import { Extension } from "@tiptap/core";
import BubbleMenu from "@tiptap/extension-bubble-menu";
import InsertLinkUI from "./InsertLinkUI.svelte";

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    insertLink: {
      /**
       * Comments will be added to the autocomplete.
       */
      toggleLinkUI: () => ReturnType;
    }
  }
}

export interface InsertLinkOptions {
  /** The element that the editor attachs to.
   * Must be set otherwise this extension will not work.
   */
  editorEl: HTMLElement,
}

export interface InsertLinkStorage {
  showUI: boolean,
  UIComponent?: InsertLinkUI,
}

/**
 * Creates an UI for inserting links.
 * Must configure the editorEl that the editor attaches to.
 */
export const InsertLink = Extension.create<InsertLinkOptions, InsertLinkStorage>({
  name: "insertLink",
  addOptions() {
    return {
      editorEl: null,
    }
  },
  addStorage() {
    return {
      showUI: false,
      UIcomponent: null,
    }
  },
  addExtensions() {
    const elID = "insertLinkUI";
    let div = document.createElement("div");
    div.id = elID;
    this.options.editorEl.after(div);
    let el = document.getElementById(elID);
    this.storage.UIComponent = new InsertLinkUI({
      target: el,
    });
    return [
      BubbleMenu.configure({
        element: el,
        shouldShow: () => {
          return this.storage.showUI;
        },
      }),
    ]
  },
  addCommands() {
    return {
      toggleLinkUI: () => ({ editor, commands }) => {
        this.storage.showUI = !this.storage.showUI;
        this.storage.UIComponent.$set({
          editor: editor,
          linkTargetURL: editor.getAttributes("link").href,
        });
        return commands.focus();
      }
    }
  },
  onSelectionUpdate() {
    this.storage.showUI = false;
  }
});
