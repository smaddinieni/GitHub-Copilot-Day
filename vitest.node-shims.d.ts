/**
 * Minimal Node module shims for the Vitest config so the production
 * TypeScript build can typecheck without adding an `@types/node` dependency.
 */
declare module "node:fs" {
  export function readFileSync(path: string, encoding: "utf8"): string;
}

declare module "node:path" {
  export function isAbsolute(path: string): boolean;
  export function dirname(path: string): string;
  export function resolve(...paths: string[]): string;
}

declare module "node:url" {
  export function fileURLToPath(url: string): string;
}