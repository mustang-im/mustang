import type { Editor } from "@tiptap/core";

export class EditorClipboard {
  static cut(editor: Editor) {
    editor.commands.focus();
    document.execCommand("cut");
  }

  static copy(editor: Editor) {
    editor.commands.focus();
    document.execCommand("copy");
  }

  static async paste(editor: Editor) {
    editor.commands.focus();
    if (document.execCommand("paste")) {
      return;
    }
    for (let item of await navigator.clipboard.read()) {
      if (item.types.includes("text/html")) {
        let html = await (await item.getType("text/html")).text();
        editor.view.pasteHTML(html);
        return;
      }
    }
    editor.view.pasteText(await navigator.clipboard.readText());
  }

  static async pasteAsText(editor: Editor) {
    editor.commands.focus();
    editor.view.pasteText(await navigator.clipboard.readText());
  }
}
