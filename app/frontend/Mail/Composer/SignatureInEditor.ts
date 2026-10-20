import type { EMail } from "../../../logic/Mail/EMail";
import type { MailIdentity } from "../../../logic/Mail/MailIdentity";
import type { Editor } from "@tiptap/core";

/* The editor holds the body while composing, so these functions take the body
 * from the editor and put the result back into it. The editor then updates the mail. */

/** When the composer opens a new mail, reply or forward:
 * Shows the signature of the From identity in the body */
export function addSignatureInEditor(editor: Editor, mail: EMail, identity: MailIdentity) {
  if (!isReady(editor)) {
    return;
  }
  setBody(editor, mail.compose.addSignature(identity, editor.getHTML()));
}

/** The user changed the From identity: Swaps the signature in the body */
export function changeSignatureInEditor(editor: Editor, mail: EMail, identity: MailIdentity) {
  if (!isReady(editor)) {
    return;
  }
  setBody(editor, mail.compose.changeSignature(identity, editor.getHTML()));
}

/** The user picked the signature of `identity`, e.g. from a menu:
 * Replaces the signature in the body, or adds it */
export function putSignatureInEditor(editor: Editor, mail: EMail, identity: MailIdentity) {
  if (!isReady(editor)) {
    return;
  }
  setBody(editor, mail.compose.putSignature(identity, editor.getHTML()));
}

/** Puts the cursor at the end of the user's text, right before our signature.
 * @returns false, if there is no signature */
export function focusBeforeSignature(editor: Editor): boolean {
  if (!isReady(editor)) {
    return false;
  }
  let signaturePos: number | null = null;
  editor.state.doc.forEach((node, offset) => {
    if (signaturePos == null && node.type.name == "footer" && node.attrs.ownSignature) {
      signaturePos = offset;
    }
  });
  if (!signaturePos) { // null or the very start
    return false;
  }
  // `signaturePos - 1` is the end of the content of the block before the signature
  editor.chain().focus().setTextSelection(signaturePos - 1).run();
  return true;
}

/** Not an undo step: Undo should not bring back the signature of the previous identity.
 * Keeps the cursor where the user was writing. */
function setBody(editor: Editor, html: string | null) {
  if (html == null) {
    return;
  }
  let { from } = editor.state.selection;
  editor.chain()
    .command(({ tr }) => {
      tr.setMeta("addToHistory", false);
      return true;
    })
    .setContent(html)
    .setTextSelection(from)
    .run();
}

function isReady(editor: Editor | null): boolean {
  return !!editor && !editor.isDestroyed;
}
