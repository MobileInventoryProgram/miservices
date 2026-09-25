/** Shapes of website content from the CMS (see sanity/schemas/objects and site/) */
export interface CmsLink {
  label: string;
  href: string;
}
export interface CmsMenuLink extends CmsLink {
  description?: string;
  icon?: string;
}
export interface CmsImage {
  asset?: { _ref: string };
  alt?: string;
  hotspot?: unknown;
  crop?: unknown;
}
export interface CmsSeo {
  metaTitle?: string;
  metaDescription?: string;
  keywords?: string;
  ogImage?: CmsImage;
  noIndex?: boolean;
}
export interface CmsHero {
  heading: string;
  subheading?: string;
  primaryButton?: CmsLink;
  secondaryButton?: CmsLink;
  image?: CmsImage;
}
export interface CmsCta {
  heading?: string;
  text?: string;
  primaryButton?: CmsLink;
  secondaryButton?: CmsLink;
}
export interface CmsFeature {
  _key?: string;
  icon?: string;
  title?: string;
  description?: string;
  href?: string;
}
export interface CmsStat {
  _key?: string;
  value: string;
  label: string;
  icon?: string;
}
export interface CmsFaq {
  _key?: string;
  question: string;
  answer: string;
}
export interface CmsStep {
  _key?: string;
  title: string;
  description?: string;
}
export interface CmsTestimonial {
  _key?: string;
  quote: string;
  name?: string;
  role?: string;
}
export interface CmsPanel {
  eyebrow?: string;
  heading?: string;
  text?: string;
  button?: CmsLink;
}
export interface CmsMenuGroup {
  _key?: string;
  title?: string;
  numbered?: boolean;
  links?: CmsMenuLink[];
}

export interface SiteSettings {
  siteName: string;
  legalName?: string;
  companyNumber?: string;
  phone?: string;
  email?: string;
  address?: string[];
  discoveryCall?: { title?: string; calendarUrl?: string };
  social?: { linkedin?: string; facebook?: string; instagram?: string; x?: string; youtube?: string };
  servicesMenuLabel?: string;
  servicesMenu?: CmsMenuGroup[];
  networkMenuLabel?: string;
  networkLocal?: CmsPanel;
  networkFranchise?: CmsPanel;
  moreMenuLabel?: string;
  moreMenu?: CmsMenuGroup[];
  headerButtons?: CmsLink[];
  footerTagline?: string;
  footerColumns?: { _key?: string; title?: string; links?: CmsLink[] }[];
  footerContactHeading?: string;
  footerCoverageLink?: CmsLink;
  footerContactButton?: CmsLink;
  footerLocationsHeading?: string;
  footerLocations?: { _key?: string; label?: string; slug?: string; name?: string }[];
  copyright?: string;
  legalLinks?: CmsLink[];
  defaultTitle?: string;
  titleSuffix?: string;
  defaultDescription?: string;
  defaultKeywords?: string;
  defaultShareImage?: CmsImage;
}
