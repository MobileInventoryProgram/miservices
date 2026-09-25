/**
 * Icons editors can choose in the CMS (feature cards, menus, stats…).
 * Plain names so the Studio schema can import them; rendered by lib/cms/icons.tsx.
 */
export const ICON_OPTIONS = [
  { title: 'Award', value: 'award' },
  { title: 'Book', value: 'book' },
  { title: 'Book (open)', value: 'bookOpen' },
  { title: 'Briefcase', value: 'briefcase' },
  { title: 'Calendar', value: 'calendar' },
  { title: 'Camera', value: 'camera' },
  { title: 'Check', value: 'check' },
  { title: 'Check circle', value: 'checkCircle' },
  { title: 'Clipboard', value: 'clipboard' },
  { title: 'Clock', value: 'clock' },
  { title: 'Credit card', value: 'creditCard' },
  { title: 'Document', value: 'fileText' },
  { title: 'Eye', value: 'eye' },
  { title: 'Help', value: 'helpCircle' },
  { title: 'Home', value: 'home' },
  { title: 'Key', value: 'key' },
  { title: 'Layers', value: 'layers' },
  { title: 'Mail', value: 'mail' },
  { title: 'Map pin', value: 'mapPin' },
  { title: 'Percent', value: 'percent' },
  { title: 'Phone', value: 'phone' },
  { title: 'Pound sign', value: 'pound' },
  { title: 'Refresh', value: 'rotateCcw' },
  { title: 'Search', value: 'search' },
  { title: 'Settings', value: 'settings' },
  { title: 'Shield', value: 'shield' },
  { title: 'Smartphone', value: 'smartphone' },
  { title: 'Star', value: 'star' },
  { title: 'Tool', value: 'tool' },
  { title: 'Trending up', value: 'trendingUp' },
  { title: 'User', value: 'user' },
  { title: 'User (checked)', value: 'userCheck' },
  { title: 'Users', value: 'users' },
  { title: 'Warning', value: 'alertTriangle' },
] as const;

export type IconName = (typeof ICON_OPTIONS)[number]['value'];
