import assert from 'node:assert/strict';
import { build } from 'esbuild';
import ts from 'typescript';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { checkInteractions } from './snippet-interactions.mjs';

const root = fileURLToPath(new URL('../../../', import.meta.url));
const result = await build({
  stdin: {
    contents: `export { getSampleDocumentation } from './examples/basic/src/samples/documentation';
export { SAMPLE_PAGES, resolveProviderForPage } from './examples/basic/src/samples/sampleRegistry';
export { DOCUMENTATION_PROVIDERS } from './examples/basic/src/samples/sampleDocumentationProviders';`,
    resolveDir: root,
  },
  bundle: true, write: false, platform: 'node', format: 'esm',
});
const { getSampleDocumentation, SAMPLE_PAGES, DOCUMENTATION_PROVIDERS, resolveProviderForPage } =
  await import(`data:text/javascript;base64,${Buffer.from(result.outputFiles[0].text).toString('base64')}`);

// Virtual files let TypeScript check exactly the text displayed to readers,
// without producing or maintaining a second copy of every example.
const snippets = new Map();
for (const page of SAMPLE_PAGES) {
  for (const provider of DOCUMENTATION_PROVIDERS) {
    if (page.unavailableProviders?.includes(provider)) continue;
    const resolved = resolveProviderForPage(provider, page.id);
    const doc = getSampleDocumentation(page.id, resolved, 'ja');
    assert.match(doc.code, /export default function App\(\)/);
    assert.doesNotMatch(doc.code, /MapViewContainer|providerDesignOptions|example\.com/);
    assert.doesNotMatch(doc.code, /MapConductor overlays/, `${page.id} needs page-specific documentation`);
    snippets.set(path.join(root, 'examples/basic', `__snippet_${page.id}_${provider}.tsx`), doc.code);
  }
}
assert.match(getSampleDocumentation('marker', 'google').code, /GoogleMapView2D/);
assert.match(getSampleDocumentation('marker', 'google-3d').code, /GoogleMapView\b/);
const options = {
  target: ts.ScriptTarget.ES2022,
  module: ts.ModuleKind.ESNext,
  moduleResolution: ts.ModuleResolutionKind.Bundler,
  jsx: ts.JsxEmit.ReactJSX,
  strict: true, noEmit: true, skipLibCheck: true,
  noUnusedLocals: true, noUnusedParameters: true,
  allowSyntheticDefaultImports: true, esModuleInterop: true,
  types: ['vite/client'],
};
const host = ts.createCompilerHost(options);
const readFile = host.readFile.bind(host);
const fileExists = host.fileExists.bind(host);
host.readFile = name => snippets.get(name) ?? readFile(name);
host.fileExists = name => snippets.has(name) || fileExists(name);
const program = ts.createProgram([...snippets.keys()], options, host);
const diagnostics = ts.getPreEmitDiagnostics(program).filter(d => !d.file || snippets.has(d.file.fileName));
if (diagnostics.length) {
  console.error(ts.formatDiagnosticsWithColorAndContext(diagnostics, {
    getCanonicalFileName: name => name, getCurrentDirectory: () => root, getNewLine: () => '\n',
  }));
  process.exitCode = 1;
} else {
  console.log(`Checked ${snippets.size} snippets (${SAMPLE_PAGES.length} pages, ${DOCUMENTATION_PROVIDERS.length} providers).`);
  checkInteractions(getSampleDocumentation, SAMPLE_PAGES);
}
