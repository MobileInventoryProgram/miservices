import post from './post';
import page from './page';
import author from './author';
import tag from './tag';
import service from './service';
import franchisee from './franchisee';
import member from './member';
import memberDocument from './memberDocument';
import documentSection from './documentSection';
import helpArticle from './helpArticle';
import complianceRequirement from './complianceRequirement';
import complianceRecord from './complianceRecord';
import complianceSetting from './complianceSetting';
import complianceReminder from './complianceReminder';
import membersArea from './membersArea';
import priceList from './priceList';
import flyerSettings from './flyerSettings';
import contact from './contact';
import quote from './quote';
import quoteTemplate from './quoteTemplate';
import { objectTypes } from './objects';
import { siteTypes } from './site';

export const schemaTypes = [
  ...objectTypes,
  ...siteTypes,
  post,
  page,
  author,
  tag,
  service,
  franchisee,
  member,
  memberDocument,
  documentSection,
  helpArticle,
  complianceRequirement,
  complianceRecord,
  complianceSetting,
  complianceReminder,
  membersArea,
  priceList,
  flyerSettings,
  contact,
  quote,
  quoteTemplate,
];
