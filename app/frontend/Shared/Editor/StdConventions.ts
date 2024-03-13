import { markInputRule, markPasteRule } from '@tiptap/core';
import { Bold } from '@tiptap/extension-bold';
import { Italic } from '@tiptap/extension-italic';

export const starInputRegex = /(?:^|\s)((?:\*)((?:[^*]+))(?:\*))$/
export const starPasteRegex = /(?:^|\s)((?:\*)((?:[^*]+))(?:\*))/g

/** Makes `*abc*` **bold** instead of _italic_ */
export const BoldStar = Bold.extend({
  addInputRules() {
    return [
      markInputRule({
        find: starInputRegex,
        type: this.type,
      }),
    ]
  },
  addPasteRules() {
    return [
      markPasteRule({
        find: starPasteRegex,
        type: this.type,
      }),
    ]
  },
});

export const slashInputRegex = /(?:^|\s)((?:\/)((?:[^*]+))(?:\/))$/
export const slashPasteRegex = /(?:^|\s)((?:\/)((?:[^*]+))(?:\/))/g

/** Makes `/abc/` _italic_ */
export const ItalicSlash = Italic.extend({
  addInputRules() {
    return [
      markInputRule({
        find: slashInputRegex,
        type: this.type,
      }),
    ]
  },
  addPasteRules() {
    return [
      markPasteRule({
        find: slashPasteRegex,
        type: this.type,
      }),
    ]
  },
});