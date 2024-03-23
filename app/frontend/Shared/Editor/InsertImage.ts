import type { Editor } from "@tiptap/core";
import { blobToBase64, blobToDataURL } from "../../../logic/util/util";

export function insertImage(editor: Editor, file: File) {
  let url = URL.createObjectURL(file);
  // TODO maybe base64? let url = await blobToDataURL(file);
  editor.chain().focus().setImage({ src: url }).run();
}

export function isImageMimetype(type: string) {
  return type == "image/png" ||
    type == "image/jpeg" ||
    type == "image/gif";
}
