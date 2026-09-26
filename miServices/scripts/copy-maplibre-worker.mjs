// MapLibre's map worker has to be served from our own site: copy it (and the
// code it shares with the main library) into public/maplibre on every install.
import { copyFileSync, mkdirSync, existsSync } from 'node:fs';

const from = 'node_modules/maplibre-gl/dist';
const to = 'public/maplibre';
if (existsSync(from)) {
  mkdirSync(to, { recursive: true });
  for (const file of ['maplibre-gl-worker.mjs', 'maplibre-gl-shared.mjs']) copyFileSync(`${from}/${file}`, `${to}/${file}`);
}
