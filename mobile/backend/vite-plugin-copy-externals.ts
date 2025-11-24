import fs from "fs";
import path from "path";
import { Plugin } from "vite";
import pkg from "@yarnpkg/lockfile";

const { parse: parseYarnLock } = pkg;

interface CopyExternalsOptions {
  deps: string[];        // packages to copy
  outDir?: string;       // output directory
  rootDir?: string;      // project root (defaults to process.cwd())
  lockFile?: "yarn" | "npm"; // which lockfile to use (default autodetect)
}

export function copyExternals(options: CopyExternalsOptions): Plugin {
  const { deps, outDir, rootDir, lockFile } = options;

  return {
    name: "copy-externals",
    apply: "build",
    closeBundle() {
      const root = rootDir ?? process.cwd();
      const outputDir = outDir ?? path.join(root, "dist", "nodejs", "node_modules");

      // --- 1) Read lockfile ---
      let depGraph: Record<string, string[]> = {}; // { package: [subdeps] }

      // Detect lockfile type if not specified
      let detectedLockFile: "yarn" | "npm" | null = lockFile ?? null;
      const yarnLockPath = path.join(root, "yarn.lock");
      const npmLockPath = path.join(root, "package-lock.json");

      if (!detectedLockFile) {
        if (fs.existsSync(yarnLockPath)) detectedLockFile = "yarn";
        else if (fs.existsSync(npmLockPath)) detectedLockFile = "npm";
      }

      if (detectedLockFile === "yarn") {
        const yarnLock = fs.readFileSync(yarnLockPath, "utf8");
        const parsed = parseYarnLock(yarnLock);
        if (parsed.type !== "success") throw new Error("Failed to parse yarn.lock");

        for (const key in parsed.object) {
          const depsObj = parsed.object[key].dependencies ?? {};
          const name = key.split("@")[0];
          depGraph[name] = Object.keys(depsObj);
        }
      } else if (detectedLockFile === "npm") {
        const lockJson = JSON.parse(fs.readFileSync(npmLockPath, "utf8"));
        const traverse = (deps: Record<string, any>, parent?: string) => {
          for (const depName in deps) {
            const subDeps = deps[depName].dependencies ?? {};
            depGraph[depName] = Object.keys(subDeps);
            traverse(subDeps, depName);
          }
        };
        traverse(lockJson.dependencies ?? {});
      } else {
        console.warn("[copy-externals] No lockfile found; falling back to node_modules traversal");
      }

      // --- 2) Copy deps recursively ---
      const visited = new Set<string>();

      function copyDependency(depName: string) {
        if (visited.has(depName)) return;
        visited.add(depName);

        const depPath = path.join(root, "node_modules", depName);
        if (!fs.existsSync(depPath)) {
          console.warn(`[copy-externals] ⚠️ Could not resolve ${depName}`);
          return;
        }

        const destPath = path.join(outputDir, depName);
        fs.cpSync(depPath, destPath, { recursive: true, force: true, errorOnExist: false });

        // Copy sub-dependencies
        const subDeps = depGraph[depName] ?? [];
        subDeps.forEach(copyDependency);
      }

      deps.forEach(copyDependency);
      console.log(`✅ [copy-externals] Copied deps: ${deps.join(", ")} → ${outputDir}`);
    },
  };
}
