import { defineConfig, type Plugin } from "vitest/config";

/**
 * Resolves Vite `?raw` imports during tests. The test config runs separately
 * from `vite.config.ts`, so Vite's built-in `?raw` handling is not applied.
 * Production builds keep using Vite's native `?raw` support.
 */
function rawImportPlugin(): Plugin {
  let projectRoot = "";

  return {
    name: "vitest-raw-import",
    enforce: "pre",
    configResolved(config) {
      projectRoot = config.root;
    },
    async resolveId(id, importer) {
      const [pathModule, fsModule, urlModule] = await Promise.all([
        import("node:path"),
        import("node:fs"),
        import("node:url"),
      ]);
      void fsModule;

      if (!id.endsWith("?raw")) {
        return null;
      }

      const filePath = id.slice(0, -"?raw".length);
      const absolutePath =
        importer && !pathModule.isAbsolute(filePath)
          ? pathModule.resolve(
              pathModule.dirname(
                importer.startsWith("file:")
                  ? urlModule.fileURLToPath(importer)
                  : importer,
              ),
              filePath,
            )
          : pathModule.resolve(projectRoot, filePath);

      return `\0raw:${absolutePath}`;
    },
    async load(id) {
      if (!id.startsWith("\0raw:")) {
        return null;
      }

      const [fsModule, urlModule] = await Promise.all([
        import("node:fs"),
        import("node:url"),
      ]);
      const rawPath = id.slice("\0raw:".length);
      const filePath = rawPath.startsWith("file:")
        ? urlModule.fileURLToPath(rawPath)
        : rawPath;

      return `export default ${JSON.stringify(
        fsModule.readFileSync(filePath, "utf8"),
      )};`;
    },
  };
}

export default defineConfig({
  plugins: [rawImportPlugin()],
  test: {
    environment: "node",
  },
});
