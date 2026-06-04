import { markInputRule, markPasteRule } from '@tiptap/core';
import { Bold } from '@tiptap/extension-bold';
import { Italic } from '@tiptap/extension-italic';
import { Strike } from '@tiptap/extension-strike';

export const starInputRegex = /(?:^|\s)((?:\*)((?:\p{Letter}(?:[^*\n]*\p{Letter})?))(?:\*))$/u
export const starPasteRegex = /(?:^|\s)((?:\*)((?:\p{Letter}(?:[^*\n]*\p{Letter})?))(?:\*))/gu

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

export const slashInputRegex = /(?:^|\s)((?:\/)((?:\p{Letter}(?:[^\/\n]*\p{Letter})?))(?:\/))$/u
export const slashPasteRegex = /(?:^|\s)((?:\/)((?:\p{Letter}(?:[^\/\n]*\p{Letter})?))(?:\/))/gu

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

const doubleTildeInputRegex = /(?:^|\s)((?:~~)((?:\p{Letter}(?:(?:(?!~~)[^\n])*\p{Letter})?))(?:~~))$/u
const doubleTildePasteRegex = /(?:^|\s)((?:~~)((?:\p{Letter}(?:(?:(?!~~)[^\n])*\p{Letter})?))(?:~~))/gu

/** Makes `~~abc~~` ~~strike~~ */
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
