import siteSettings from './siteSettings';
import { pageTypes } from './pages';
import audiencePage from './audiencePage';

/** Website content types: settings, page singletons and collections */
export const siteTypes = [siteSettings, ...pageTypes, audiencePage];

