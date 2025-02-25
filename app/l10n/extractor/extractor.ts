import { build, loadConfigFromFile } from "vite";
import { svelte } from "../vite-plugin-svelte/src/index";
import svelteConfig from "../../svelte.config";
import { jsTsExtractor } from "./tsExtractor";

export const strings = [];

extract();

async function extract() {
  let config = (await loadConfigFromFile({ command: "build", mode: ""}, "./vite.config.ts"))?.config;
  let sveltePluginIdx = config.plugins.findIndex(p => p[0] && p[0]["name"] == "vite-plugin-svelte");
  config.plugins[sveltePluginIdx] = svelte(svelteConfig);
  config.plugins = config.plugins.slice(0, sveltePluginIdx + 1);
  config.plugins.push(jsTsExtractor());
  
  await build(config);
}

