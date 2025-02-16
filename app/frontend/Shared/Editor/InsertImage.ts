import type { Editor } from "@tiptap/core";
import { Attachment, ContentDisposition } from "../../../logic/Abstract/Attachment";
import type { Collection } from "svelte-collections";

export async function insertImage(editor: Editor, file: File, attachments: Collection<Attachment>) {
  let url = URL.createObjectURL(file);
  console.log("inline image drop", url);
  editor.chain().focus().setImage({ src: url }).run();
  // On send or save, need to convert to proper attachment and cid: URL
  let attachment = Attachment.fromFile(file);
  attachment.disposition = ContentDisposition.inline;
  attachment.related = true;
  attachment.blobURL = url;
  attachments.add(attachment);
}

export function isImageMimetype(type: string) {
  return type == "image/png" ||
    type == "image/jpeg" ||
    type == "image/gif";
}
