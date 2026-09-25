import 'server-only';
import { cache } from 'react';
import { sanityLiveClient } from '@/lib/sanity';

type Tile = { title?: string; description?: string };
type Heading = { heading?: string; intro?: string; introAdmin?: string; empty?: string };

/** The wording of the Franchise Login area (CMS: Franchise Login text) */
export interface MembersAreaText {
  login?: { heading?: string; intro?: string; forgotText?: string; needAccessText?: string; needAccessLink?: { label: string; href: string } };
  dashboard?: { documents?: Tile; pricingQuoting?: Tile; assets?: Tile; contacts?: Tile };
  documents?: Heading;
  documentNotice?: string;
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
