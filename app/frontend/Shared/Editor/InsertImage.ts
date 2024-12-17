import type { Editor } from "@tiptap/core";
import { blobToDataURL } from "../../../logic/util/util";

export async function insertImage(editor: Editor, file: File) {
  // TODO Creates blob: URL. Fails on send. But: ...
  // let url = URL.createObjectURL(file);
  // On send or save, should convert to proper attachment and cid: URL
  let url = await blobToDataURL(file);
  console.log("inline image drop", url);
  editor.chain().focus().setImage({ src: url }).run();
}

export function isImageMimetype(type: string) {
  return type == "image/png" ||
    type == "image/jpeg" ||
    type == "image/gif";
}
