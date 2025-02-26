import { walk } from 'estree-walker-ts';
import { parse as tsParse } from '@typescript-eslint/typescript-estree';
import { extractPluralMessages, extractPlurals, extractTags } from './utils';
import { onMessageExtracted } from "./extractor";

export function tsExtract(code: string, filename: string) {
  if (!filename.endsWith(".ts") &&!filename.endsWith(".js")) {
    return;
  }
  const ast = tsParse(code, {
    filePath: filename,
    loc: true,
  });

  walk(ast, {
    enter(node, _parent, _prop, _index) {
      extractTags(['gt', 'msg'], node, filename, onMessageExtracted);
      extractPlurals(['gPlural'], node, filename, onMessageExtracted);
      extractPluralMessages(['msgPlural'], node, filename, onMessageExtracted);
    },
  });
}