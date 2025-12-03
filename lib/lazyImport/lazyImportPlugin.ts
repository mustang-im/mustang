import type { Plugin } from "vite";
import MagicString from 'magic-string';
import { findStaticImports } from 'mlly';

const lazyImportRegex = /lazyImport\s*\(\s*(['"`])(.*?)\1\s*\)/g;

const lazyImportCache = `
globalThis.__modulesCache__ = new Map();
globalThis.__lazyImport__ = async function(modulePath, importer) {
  let module = globalThis.__modulesCache__.get(modulePath);
  if (!module) {
    module = await importer();
    globalThis.__modulesCache__.set(modulePath, module);
  }
  return module;
}
`

const entryFile = "index.js";

export function lazyImportPlugin(): Plugin {
  let injected = false;

  return {
    name: "lazy-import-plugin",
    transform(code, id, options) {
      console.log(id);

      let s = new MagicString(code);

      if (!injected && !code.includes(lazyImportCache)) {
        const lastESMImport = findStaticImports(code).pop();
        const indexToAppend = lastESMImport ? lastESMImport.end : 0;
        s = s.appendRight(indexToAppend, lazyImportCache);
        injected = true;
      }

      if (id.includes("node_modules")) {
        return {
          code: s.toString(),
          map: s.generateMap(),
        };
      }

      if (!lazyImportRegex.test(code)) {
        return null;
      }

      s = s.replaceAll(lazyImportRegex,
        (match, quote, path) => {
          return `globalThis.__lazyImport__(${quote}${path}${quote}, () => import(${quote}${path}${quote}))`;
        }
      );

      return {
        code: s.toString(),
        map: s.generateMap(),
      }
    },
  }
}
