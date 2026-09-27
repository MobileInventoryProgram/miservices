import { ICON_OPTIONS } from '../cms/icon-names';

/**
 * Documents section settings shared by the Studio schema and Franchise Login.
 * Plain values only, so the Studio can import this file.
 */
export const SECTION_COLOURS = [
  { title: 'Blue', value: 'bg-blue-500' },
  { title: 'Indigo', value: 'bg-indigo-500' },
  { title: 'Teal', value: 'bg-teal-500' },
  { title: 'Orange', value: 'bg-orange-500' },
  { title: 'Green', value: 'bg-green-500' },
  { title: 'Red', value: 'bg-red-500' },
  { title: 'Purple', value: 'bg-purple-500' },
];

export const DEFAULT_SECTION_COLOUR = 'bg-blue-500';
export const DEFAULT_SECTION_ICON = 'fileText';

export interface SectionInput {
  title: string;
  description: string;
  icon: string;
  colour: string;
}

/** Tidy a submitted section, or say what's wrong with it */
export function readSectionInput(body: Record<string, unknown>): { input: SectionInput } | { error: string } {
  const title = typeof body.title === 'string' ? body.title.trim().slice(0, 60) : '';
  if (!title) return { error: 'Please give the section a name.' };
  const description = typeof body.description === 'string' ? body.description.trim().slice(0, 160) : '';
  const icon = typeof body.icon === 'string' && ICON_OPTIONS.some((o) => o.value === body.icon) ? body.icon : DEFAULT_SECTION_ICON;
  const colour = typeof body.colour === 'string' && SECTION_COLOURS.some((c) => c.value === body.colour) ? body.colour : DEFAULT_SECTION_COLOUR;
  return { input: { title, description, icon, colour } };
}
