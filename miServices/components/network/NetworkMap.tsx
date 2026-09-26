'use client';

import 'maplibre-gl/dist/maplibre-gl.css';
import { useEffect, useRef, useState } from 'react';
import type { GeoJSONSource, LngLatBoundsLike, Map as MapLibreMap, Marker } from 'maplibre-gl';

export type LngLat = [number, number];

export interface MapFranchise {
  slug: string;
  name: string;
  town: string;
  pin: LngLat;
  points: LngLat[];
  headOffice?: boolean;
}

interface Props {
  franchises: MapFranchise[];
  /** Franchises to show strongly; the rest are dimmed. Empty = all equal */
  highlight?: string[];
  /** A franchise being hovered in the list */
  hovered?: string | null;
  /** A place that was searched for */
  searchPoint?: LngLat | null;
  /** What to frame: these franchises (and the searched place), or the whole UK */
  frame?: string[];
  /** Room to leave on the left for the hero text, as a share of the width (desktop only) */
  leftSpace?: number;
  /** Ask for two fingers / ctrl+scroll to move the map, so the page still scrolls */
  cooperative?: boolean;
  className?: string;
}

const STYLE = 'https://tiles.openfreemap.org/styles/positron';
const UK: LngLatBoundsLike = [
  [-8.2, 49.9],
  [1.8, 58.7],
];
const DARK = '#3f59a9';
const LIGHT = '#157ec3';

/** Recolour the base map in the brand's soft blues */
function brandStyle(map: MapLibreMap) {
  for (const layer of map.getStyle().layers || []) {
    if (layer.id === 'background') map.setPaintProperty(layer.id, 'background-color', '#f3f6fb');
    else if (layer.id === 'water' && layer.type === 'fill') map.setPaintProperty(layer.id, 'fill-color', '#c9dcf0');
    else if (layer.id === 'waterway') map.setPaintProperty(layer.id, 'line-color', '#c9dcf0');
    else if (/^(park|landcover_wood|landuse_residential)$/.test(layer.id)) map.setPaintProperty(layer.id, 'fill-color', '#e8eef7');
    else if (layer.id.startsWith('boundary')) map.setPaintProperty(layer.id, 'line-color', '#9fb3d9');
  }
}

function pinElement(f: MapFranchise) {
  const el = document.createElement('button');
  el.type = 'button';
  el.className = 'network-pin';
  el.setAttribute('aria-label', `${f.name} — ${f.town}`);
  el.innerHTML = `<svg width="30" height="40" viewBox="0 0 30 40" aria-hidden="true"><path d="M15 39s13-13.6 13-24A13 13 0 0 0 2 15c0 10.4 13 24 13 24z" fill="${f.headOffice ? LIGHT : DARK}" stroke="#fff" stroke-width="2"/><circle cx="15" cy="15" r="5" fill="#fff"/></svg>`;
  return el;
}

function popupContent(f: MapFranchise) {
  const wrap = document.createElement('div');
  wrap.className = 'network-popup';
  const title = document.createElement('p');
  title.className = 'network-popup-title';
  title.textContent = f.name;
  const town = document.createElement('p');
  town.className = 'network-popup-town';
  town.textContent = f.headOffice ? `Head Office · ${f.town}` : f.town;
  const link = document.createElement('a');
  link.href = `/our-network/${f.slug}`;
  link.className = 'network-popup-link';
  link.textContent = 'View branch →';
  wrap.append(title, town, link);
  return wrap;
}

/** The franchise network on a map: a pin per branch, and a soft dot for each postcode district it covers */
export default function NetworkMap({ franchises, highlight = [], hovered = null, searchPoint = null, frame = [], leftSpace = 0, cooperative = true, className = '' }: Props) {
  const container = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MapLibreMap | null>(null);
  const markers = useRef<Map<string, Marker>>(new Map());
  const searchMarker = useRef<Marker | null>(null);
  const ready = useRef<Promise<typeof import('maplibre-gl')> | null>(null);
  const refit = useRef<(() => void) | null>(null);
  const [loaded, setLoaded] = useState(false);

  // Create the map once
  useEffect(() => {
    let cancelled = false;
    ready.current = import('maplibre-gl').then((maplibre) => {
      if (cancelled || !container.current) return maplibre;
      maplibre.setWorkerUrl('/maplibre/maplibre-gl-worker.mjs');
      const map = new maplibre.Map({
        container: container.current,
        style: STYLE,
        bounds: UK,
        attributionControl: false,
        cooperativeGestures: cooperative,
        dragRotate: false,
        pitchWithRotate: false,
        touchPitch: false,
      });
      map.touchZoomRotate.disableRotation();
      // Map and postcode credits, folded into the small (i) button
      map.addControl(
        new maplibre.AttributionControl({ compact: true, customAttribution: 'Postcode data: Contains OS data © Crown copyright and database right' }),
        'bottom-right'
      );
      mapRef.current = map;

      map.on('load', () => {
        brandStyle(map);
        map.getContainer().querySelector('.maplibregl-ctrl-attrib')?.classList.remove('maplibregl-compact-show');
        map.addSource('coverage', {
          type: 'geojson',
          data: {
            type: 'FeatureCollection',
            features: franchises.flatMap((f) =>
              f.points.map((p) => ({ type: 'Feature' as const, properties: { slug: f.slug }, geometry: { type: 'Point' as const, coordinates: p } }))
            ),
          },
        });
        map.addLayer({
          id: 'coverage',
          type: 'circle',
          source: 'coverage',
          paint: {
            'circle-color': LIGHT,
            'circle-radius': ['interpolate', ['linear'], ['zoom'], 4, 3, 7, 8, 10, 22, 13, 60],
            'circle-opacity': 0.22,
            'circle-blur': 0.4,
          },
        });

        for (const f of franchises) {
          const popup = new maplibre.Popup({ offset: 30, closeButton: false, maxWidth: '240px' }).setDOMContent(popupContent(f));
          const marker = new maplibre.Marker({ element: pinElement(f), anchor: 'bottom' }).setLngLat(f.pin).setPopup(popup).addTo(map);
          markers.current.set(f.slug, marker);
        }
        if (!cancelled) setLoaded(true);
      });
      return maplibre;
    });

    // Keep the map filling its box as the hero grows and shrinks
    let timer: ReturnType<typeof setTimeout>;
    const observer = new ResizeObserver(() => {
      mapRef.current?.resize();
      clearTimeout(timer);
      timer = setTimeout(() => refit.current?.(), 120);
    });
    if (container.current) observer.observe(container.current);

    return () => {
      cancelled = true;
      clearTimeout(timer);
      observer.disconnect();
      mapRef.current?.remove();
      mapRef.current = null;
      markers.current.clear();
    };
    // The network doesn't change while the page is open
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Emphasise the matching branches
  useEffect(() => {
    const apply = () => {
      const map = mapRef.current;
      if (!map?.getLayer('coverage')) return;
      const strong = hovered ? [hovered] : highlight;
      map.setPaintProperty(
        'coverage',
        'circle-opacity',
        strong.length ? ['case', ['in', ['get', 'slug'], ['literal', strong]], 0.45, 0.07] : 0.22
      );
      markers.current.forEach((marker, slug) => {
        const el = marker.getElement();
        const on = !strong.length || strong.includes(slug);
        // MapLibre manages the pin's opacity itself, so set it through the marker
        marker.setOpacity(on ? '1' : '0.35');
        el.style.zIndex = on ? '2' : '1';
        el.classList.toggle('network-pin-active', !!hovered && hovered === slug);
      });
    };
    if (loaded) apply();
  }, [highlight, hovered, loaded]);

  // Frame the results (or the whole UK), leaving room for the hero text
  useEffect(() => {
    if (!loaded) return;
    let cancelled = false;
    ready.current?.then((maplibre) => {
      const map = mapRef.current;
      if (cancelled || !map) return;
      const go = (animate = true) => {
        const width = map.getContainer().clientWidth;
        const height = map.getContainer().clientHeight;
        const left = width >= 768 ? Math.round(width * leftSpace) : 0;
        const pad = Math.min(48, Math.round(height / 6));
        const padding = { top: pad, bottom: pad, left: left + pad, right: pad };

        searchMarker.current?.remove();
        searchMarker.current = null;
        if (searchPoint) {
          const dot = document.createElement('div');
          dot.className = 'network-search-dot';
          searchMarker.current = new maplibre.Marker({ element: dot }).setLngLat(searchPoint).addTo(map);
        }

        const chosen = franchises.filter((f) => frame.includes(f.slug));
        if (!chosen.length && !searchPoint) {
          map.fitBounds(UK, { padding, duration: animate ? 900 : 0 });
          return;
        }
        const bounds = new maplibre.LngLatBounds();
        chosen.forEach((f) => [f.pin, ...f.points].forEach((p) => bounds.extend(p)));
        if (searchPoint) bounds.extend(searchPoint);
        map.fitBounds(bounds, { padding, maxZoom: 10, duration: animate ? 900 : 0 });
      };
      refit.current = () => go(false);
      go();
    });
    return () => {
      cancelled = true;
    };
  }, [frame, searchPoint, leftSpace, franchises, loaded]);

  // MapLibre makes its own box position: relative, so it sits inside a sized wrapper
  return (
    <div className={className}>
      <div ref={container} className="h-full w-full" />
    </div>
  );
}
