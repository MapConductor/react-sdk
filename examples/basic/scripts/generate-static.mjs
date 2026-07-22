import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const root = resolve(dirname(new URL(import.meta.url).pathname), '..');
const outputRoot = resolve(root, 'dist');
const template = await readFile(resolve(outputRoot, 'index.html'), 'utf8');
const { render, getDocumentMetadata, getStaticPaths } = await import(
  pathToFileURL(resolve(outputRoot, 'server/entry-server.mjs')).href,
);
for (const pathname of getStaticPaths()) {
  const metadata = getDocumentMetadata(pathname);
  const html = renderDocument(pathname, metadata);
  const directory = resolve(outputRoot, pathname.slice(1));
  await mkdir(directory, { recursive: true });
  await writeFile(resolve(directory, 'index.html'), html);
}

const defaultPath = '/maplibre/map/en';
await writeFile(resolve(outputRoot, 'index.html'), renderDocument(defaultPath, getDocumentMetadata(defaultPath)));

function renderDocument(pathname, metadata) {
  return template
    .replace('<html lang="en">', `<html lang="${metadata.language}">`)
    .replace('<title>MapConductor React SDK - Basic Example</title>', `<title>${escapeHtml(metadata.title)}</title>`)
    .replace('</head>', `<meta name="description" content="${escapeHtml(metadata.description)}" /></head>`)
    .replace('<div id="root"></div>', `<div id="root">${render(pathname)}</div>`);
}

function escapeHtml(value) {
  return value.replace(/[&<>"']/g, character => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  }[character]));
}
