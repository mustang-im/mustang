import baseConfig from "../../../vite.config";
import { defineConfig, mergeConfig } from "vite";

export default mergeConfig(
  baseConfig,
  defineConfig({
    root: ".",
  })
);
