// Resolve hook for `node --test`: maps the app's "@/..." alias to ./src and supplies the .ts extension
// that Metro/TypeScript let source files omit. Test-only; no runtime or build impact.
import { existsSync } from 'node:fs';
import { fileURLToPath, pathToFileURL } from 'node:url';
import path from 'node:path';

const srcRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', 'src');

function withExtension(base) {
  for (const candidate of [`${base}.ts`, `${base}.tsx`, path.join(base, 'index.ts')]) {
    if (existsSync(candidate)) return pathToFileURL(candidate).href;
  }
  return null;
}

export async function resolve(specifier, context, nextResolve) {
  if (specifier.startsWith('@/')) {
    const url = withExtension(path.join(srcRoot, specifier.slice(2)));
    if (url) return nextResolve(url, context);
  } else if (specifier.startsWith('.') && !path.extname(specifier) && context.parentURL?.startsWith('file:')) {
    const url = withExtension(path.resolve(path.dirname(fileURLToPath(context.parentURL)), specifier));
    if (url) return nextResolve(url, context);
  }
  return nextResolve(specifier, context);
}
