import type { Plugin } from "vite";

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

export function lazyImportPlugin(): Plugin {

  let injected = false;
  return {
    name: "lazy-import-plugin",
    transform(code, id, options) {

      let transformedCode: string = "";

      if (!injected) {
        transformedCode = `${lazyImportCache}\n${code}`;
      }

      if (id.includes("node_modules")) {
        return null;
      }

      if (!lazyImportRegex.test(code)) {
        return null;
      }

      transformedCode = transformedCode.replaceAll(lazyImportRegex,
        (match, quote, path) => {
          return `globalThis.__lazyImport__(${quote}${path}${quote}, () => import(${quote}${path}${quote}))`;
        }
      );

      return {
        code: transformedCode,
      }
    },
  }
}
