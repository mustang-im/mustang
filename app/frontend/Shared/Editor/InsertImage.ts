import type { Editor } from "@tiptap/core";

export function insertImage(editor: Editor, file: File) {
  let url = URL.createObjectURL(file);
  console.log("insert image", url);
  editor.chain().focus().setImage({ src: url }).run(); // TODO not working
}

export function isImageMimetype(type: string) {
  return type == "image/png" ||
    type == "image/jpeg" ||
    type == "image/gif";
}
