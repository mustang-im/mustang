import { walk } from 'estree-walker-ts';
import { parse as tsParse } from '@typescript-eslint/typescript-estree';
import { extractPluralMessages, extractPlurals, extractTags } from '../extractor';
import { strings } from "./extractor";

export function jsTsExtractor() {
  return {
    name: "js-ts-extractor",
    async transform(code, id, opts) {
      if (!id.endsWith(".ts") &&!id.endsWith(".js")) {
        return null;
      }
			const ast = tsParse(code, {
				filePath: id,
				loc: true,
			});

			// fs.writeFileSync('ast.json', JSON.stringify(ast, null, 2));

			walk(ast, {
				enter(node, _parent, _prop, _index) {
					extractTags(['gt', 'msg'], node, id, onMessageExtracted);
					extractPlurals(['gPlural'], node, id, onMessageExtracted);
					extractPluralMessages(['msgPlural'], node, id, onMessageExtracted);
				},
			});

      function onMessageExtracted(obj) {
        strings.push(obj);
      }

    }
  }
}