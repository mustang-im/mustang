const modules: Map<string, any> = new Map();

export async function lazyImport(modulePath: string) {
  let module = modules.get(modulePath);
  if (!module) {
    module = await import(modulePath);
    modules.set(modulePath, module);
  }
  return module;
}
