import { hero, link, seo } from './helpers';

/** News page copy (from app/news) and SEO for the legal pages (from app/privacy-policy, app/terms) */
export default [
  {
    _id: 'newsPage',
    _type: 'newsPage',
    hero: hero('News & Updates', 'Stay up to date with the latest insights, franchise success stories, and industry developments from miServices.'),
    emptyText: 'No posts available yet. Check back soon!',
    postCta: { heading: 'Stay Informed', text: 'Read more news and updates from miServices', button: link('View All News', '/news') },
    seo: seo(
      'News & Updates | miServices',
      'Stay up to date with the latest news, insights, and updates from miServices. Read about property inspection trends, franchise success stories, and industry developments.'
    ),
  },
  {
    __patch: { type: 'page', slugs: ['privacy-policy'] },
    _id: 'page-privacy-policy',
    _type: 'page',
    setIfMissing: { seo: seo('Privacy Policy | miServices', 'miServices privacy policy. Learn how we collect, use, and protect your personal information.') },
  },
  {
    __patch: { type: 'page', slugs: ['terms-conditions'] },
    _id: 'page-terms-conditions',
    _type: 'page',
    setIfMissing: { seo: seo('Terms & Conditions | miServices', 'miServices terms and conditions. Read our terms of service for using our property inspection services.') },
  },
];
