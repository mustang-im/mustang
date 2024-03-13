import type { Editor } from "@tiptap/core";

export function insertImage(editor: Editor, file: File) {
  let url = URL.createObjectURL(file);
  editor.chain().focus().setImage({ src: url }).run();
}

export function isImageMimetype(type: string) {
  return type == "image/png" ||
    type == "image/jpeg" ||
    type == "image/gif";
}
