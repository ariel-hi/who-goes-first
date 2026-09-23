import { createServer } from 'node:http';
import { existsSync, readFileSync, statSync } from 'node:fs';
import { extname, join, resolve, sep } from 'node:path';
import { gzipSync } from 'node:zlib';

export function staticServer(directory: string) {
  const root = resolve(directory);
  const types: Record<string, string> = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml', '.png': 'image/png', '.txt': 'text/plain', '.xml': 'application/xml' };
  return createServer((request, response) => {
    let pathname: string;
    try { pathname = decodeURIComponent(new URL(request.url || '/', 'http://local').pathname); } catch { response.writeHead(400).end(); return; }
    const headers: Record<string, string> = {};
    // Read current headers on each request: rebuilding can change CSP hashes.
    let matches = false;
    for (const line of readFileSync(join(root, '_headers'), 'utf8').split('\n')) {
      if (line.startsWith('/')) matches = line.endsWith('*') ? pathname.startsWith(line.slice(0, -1)) : pathname === line;
      const pair = line.match(/^ {2}([\w-]+): (.+)$/);
      if (matches && pair) headers[pair[1]!] = pair[2]!;
    }
    if (!['GET', 'HEAD'].includes(request.method || '')) { response.writeHead(405).end(); return; }
    let path = resolve(root, `.${pathname}`);
    if (!(path === root || path.startsWith(root + sep)) || pathname.includes('\\') || ['/_headers', '/_redirects'].includes(pathname) || pathname.split('/').some(part => part.startsWith('.'))) { response.writeHead(404, headers).end(); return; }
    if (existsSync(path) && statSync(path).isDirectory()) {
      if (!pathname.endsWith('/')) { response.writeHead(308, { ...headers, Location: `${pathname}/${new URL(request.url!, 'http://local').search}` }).end(); return; }
      path = join(path, 'index.html');
    }
    const status = existsSync(path) && statSync(path).isFile() ? 200 : 404;
    if (status === 404) path = join(root, '404.html');
    const compress = /\bgzip\b/.test(request.headers['accept-encoding'] || '') && /\.(html|js|css|svg|txt|xml)$/.test(path);
    const source = readFileSync(path);
    const body = compress ? gzipSync(source) : source;
    response.writeHead(status, { ...headers, 'Content-Type': types[extname(path)] || 'application/octet-stream', 'Content-Length': body.length, 'Vary': 'Accept-Encoding', ...(compress ? { 'Content-Encoding': 'gzip' } : {}), ...(status === 404 ? { 'X-Robots-Tag': 'noindex' } : {}) });
    response.end(request.method === 'HEAD' ? undefined : body);
  });
}
