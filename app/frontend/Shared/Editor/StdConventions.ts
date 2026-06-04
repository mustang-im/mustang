import { markInputRule, markPasteRule } from '@tiptap/core';
import { Bold } from '@tiptap/extension-bold';
import { Italic } from '@tiptap/extension-italic';
import { Strike } from '@tiptap/extension-strike';

export const starInputRegex = /(?:^|\s)((?:\*)((?:\S(?:[^*]*\S)?))(?:\*))$/
export const starPasteRegex = /(?:^|\s)((?:\*)((?:\S(?:[^*]*\S)?))(?:\*))/g

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

export const slashInputRegex = /(?:^|\s)((?:\/)((?:\S(?:[^*]*\S)?))(?:\/))$/
export const slashPasteRegex = /(?:^|\s)((?:\/)((?:\S(?:[^*]*\S)?))(?:\/))/g

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

const doubleTildeInputRegex = /(?:^|\s)((?:~~)((?:\S(?:(?:(?!~~).)*\S)?))(?:~~))$/
const doubleTildePasteRegex = /(?:^|\s)((?:~~)((?:\S(?:(?:(?!~~).)*\S)?))(?:~~))/g

export const StrikeDoubleTidle = Strike.extend({
  addInputRules() {
    return [
      markInputRule({
        find: doubleTildeInputRegex,
        type: this.type,
      }),
    ]
  },
  addPasteRules() {
    return [
      markPasteRule({
        find: doubleTildePasteRegex,
        type: this.type,
      }),
    ]
  },
});
