import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import { siteSettings } from './src/lib/site';
import { fileURLToPath } from 'node:url';

const settings = siteSettings();
let localEditorialPreview = false;
export default defineConfig({
  site: settings.url,
  output: 'static',
  cacheDir: './.astro/cache/',
  outDir: process.env.BUILD_OUT_DIR || './dist',
  trailingSlash: 'always',
  devToolbar: { enabled: false },
  // Local release fixtures contain their own package/config files; copying them
  // must not restart the live editorial preview during a browser check. Saved
  // publisher evidence is also outside the app; keep actual research records live.
  vite: { server: { watch: { ignored: ['**/artifacts/**', '**/test-results/**', '**/playwright-report/**', '**/research/source-files/**'] } } },
  integrations: [react(), {
    name: 'local-editorial-preview',
    hooks: { 'astro:config:setup': ({ command, config, updateConfig, injectRoute }) => {
      localEditorialPreview = command === 'dev' && !settings.production;
      // Release fixtures share node_modules through a junction. Vite's default
      // cache there let their builds invalidate the running app's optimized JS.
      // Keep each project and command's cache outside shared dependencies.
      updateConfig({
        vite: { cacheDir: fileURLToPath(new URL(`./.astro/vite/${command}/`, config.root)), optimizeDeps: { include: ['zod'] } },
      });
      if (localEditorialPreview) {
        injectRoute({ pattern: '/dev/games', entrypoint: './src/dev/games.astro' });
        injectRoute({ pattern: '/dev/house-rules', entrypoint: './src/dev/house-rules.astro' });
        injectRoute({ pattern: '/dev/review', entrypoint: './src/dev/review.astro' });
        injectRoute({ pattern: '/dev/coverage', entrypoint: './src/dev/coverage.astro' });
        injectRoute({ pattern: '/dev/rules/[slug]', entrypoint: './src/dev/rule.astro', prerender: false });
      }
    }, 'astro:route:setup': ({ route }) => {
      // Reviewed records can be added while the local server is running too.
      // Keep getStaticPaths for builds; avoid its cached route list in development.
      if (localEditorialPreview && route.component.replaceAll('\\', '/').endsWith('src/pages/games/[slug].astro')) {
        route.prerender = false;
      }
    } },
  }],
});
