import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig, loadEnv, type Plugin} from 'vite';
import {viteStaticCopy} from 'vite-plugin-static-copy';
import {handleBriefing} from './api/_lib/briefing';

// In development, serve the briefing form's API route the way Vercel does in
// production, so the form can be tested with `npm run dev`
function devApi(env: Record<string, string>): Plugin {
  return {
    name: 'omav-dev-api',
    configureServer(server) {
      server.middlewares.use('/api/briefing', (req, res) => {
        const send = (status: number, body: unknown) => {
          res.statusCode = status;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify(body));
        };
        if (req.method !== 'POST') return send(405, {ok: false, error: 'Use POST.'});
        let text = '';
        req.on('data', (chunk) => {
          text += chunk;
          if (text.length > 20_000) req.destroy();
        });
        req.on('end', async () => {
          let data: unknown;
          try {
            data = JSON.parse(text);
          } catch {
            return send(400, {ok: false, error: 'Invalid JSON.'});
          }
          const {status, body} = await handleBriefing(data, env);
          send(status, body);
        });
      });
    },
  };
}

// Cesium loads its workers, widgets and assets at runtime from CESIUM_BASE_URL
const cesiumSource = 'node_modules/cesium/Build/Cesium';
const cesiumBaseUrl = 'cesium';

export default defineConfig(({mode}) => {
  // All of .env.local, including server-only keys, for the dev API route only
  const env = loadEnv(mode, process.cwd(), '');
  return {
    plugins: [
      devApi(env),
      react(),
      tailwindcss(),
      viteStaticCopy({
        targets: [
          {
            src: `${cesiumSource}/{ThirdParty,Workers,Assets,Widgets}/**/*`,
            dest: cesiumBaseUrl,
            rename: {stripBase: 4}, // keep paths from Workers/, Assets/, …
          },
          // MediaPipe's hand tracker runtime, loaded when gesture control turns on
          {
            src: 'node_modules/@mediapipe/tasks-vision/wasm/vision_wasm*_internal.{js,wasm}',
            dest: 'mediapipe',
            rename: {stripBase: true},
          },
        ],
      }),
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
