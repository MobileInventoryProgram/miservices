import siteSettings from './site-settings';
import services from './services';
import servicesPage from './pages-services';
import homePage from './pages-home';
import aboutPage from './pages-about';
import audiences from './audiences';
import franchisePage from './pages-franchise';
import careersTeam from './pages-careers-team';
import faqPage from './pages-faq';
import contactPage from './pages-contact';
import bookingPricingSamples from './pages-booking-pricing-samples';
import newsLegal from './pages-news-legal';
import networkPage from './pages-network';
import membersArea from './members-area';
import franchiseLoginSettings from './franchise-login-settings';

/** Every content module, in the order they're written */
export const MODULES: Record<string, unknown[]> = {
  siteSettings,
  services,
  servicesPage,
  homePage,
  aboutPage,
  audiences,
  franchisePage,
  careersTeam,
  faqPage,
  contactPage,
  bookingPricingSamples,
  newsLegal,
  networkPage,
  membersArea,
  franchiseLoginSettings,
};
