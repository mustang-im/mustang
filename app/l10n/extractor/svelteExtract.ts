import { walk } from "estree-walker-ts";
import { parse } from "svelte/compiler";
import { vitePreprocess } from "@sveltejs/vite-plugin-svelte";
import { preprocess } from "svelte/compiler";
import { onMessageExtracted } from "./extractor";
import { extractComponent, extractPluralMessages, extractPlurals, extractTags } from "./utils";

export async function svelteExtract(code: string, filename: string) {
  if (!filename.endsWith(".svelte")) {
    return;
  }
  try {
    // Preprocess Svelte files to remove any unnecessary code
    let pre = (await preprocess(code, vitePreprocess())).code;
    let ast = parse(pre, { filename: filename });
    walk(ast, {
      enter(node, _parent, _prop, _index) {
        extractTags(['$t', 'msg'], node, filename, onMessageExtracted);
        extractPlurals(['$plural'], node, filename, onMessageExtracted);
        extractPluralMessages(['msgPlural'], node, filename, onMessageExtracted);
        extractComponent(node, filename, onMessageExtracted);
      },
    });
  } catch (ex) {
    console.error(ex);
  }
}