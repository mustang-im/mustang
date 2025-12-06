export function getModule(moduleName: string) {
  const module = globalThis.lazyModules.get(moduleName);
  if (!module) {
    throw new Error("Module not loaded");
  }
  return module;
}