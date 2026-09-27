import 'server-only';
import { cache } from 'react';
import { sanityLiveClient } from '@/lib/sanity';
import { getSiteSettings } from './site';

type Tile = { title?: string; description?: string };
type Heading = { heading?: string; intro?: string; introAdmin?: string; empty?: string };

/** The wording of the Members Area (CMS: Members Area text) */
export interface MembersAreaText {
  login?: { heading?: string; intro?: string; forgotText?: string; needAccessText?: string; needAccessLink?: { label: string; href: string } };
  dashboard?: { documents?: Tile; pricingQuoting?: Tile; assets?: Tile; contacts?: Tile };
  documents?: Heading;
  documentNotice?: string;
  helpContact?: { phone?: string; email?: string };
  pricingQuoting?: { heading?: string; intro?: string; myPricing?: Tile; pricingDocuments?: Tile; quoting?: Tile; standardPriceLists?: Tile; quoteTemplate?: Tile };
  myPricing?: Heading;
  pricingDocuments?: Heading;
  quotes?: Heading;
  contacts?: Heading;
  assets?: { heading?: string; intro?: string; brand?: Tile; social?: Tile; brandIntro?: string; socialIntro?: string };
}

export const getMembersText = cache(async (): Promise<MembersAreaText> =>
  (await sanityLiveClient.fetch<MembersAreaText | null>(`*[_id == "membersArea"][0]`).catch(() => null)) || {}
);

/** Head Office contact for the Help Centre, falling back to the main site phone and email */
export async function getHelpContact(): Promise<{ phone: string | null; email: string | null }> {
  const [text, site] = await Promise.all([getMembersText(), getSiteSettings()]);
  return {
    phone: text.helpContact?.phone || site.phone || null,
    email: text.helpContact?.email || site.email || null,
  };
}
