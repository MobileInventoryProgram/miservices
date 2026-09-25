import type { IconBaseProps, IconType } from 'react-icons';
import {
  FiAlertTriangle, FiAward, FiBook, FiBookOpen, FiBriefcase, FiCalendar, FiCamera, FiCheck, FiCheckCircle, FiClipboard,
  FiClock, FiCreditCard, FiEye, FiFileText, FiHelpCircle, FiHome, FiKey, FiLayers, FiMail, FiMapPin, FiPercent, FiPhone,
  FiRotateCcw, FiSearch, FiSettings, FiShield, FiSmartphone, FiStar, FiTool, FiTrendingUp, FiUser, FiUserCheck, FiUsers,
} from 'react-icons/fi';
import FiPoundSign from '@/components/icons/FiPoundSign';
import type { IconName } from './icon-names';

const ICONS: Record<IconName, IconType> = {
  award: FiAward, book: FiBook, bookOpen: FiBookOpen, briefcase: FiBriefcase, calendar: FiCalendar, camera: FiCamera,
  check: FiCheck, checkCircle: FiCheckCircle, clipboard: FiClipboard, clock: FiClock, creditCard: FiCreditCard,
  fileText: FiFileText, eye: FiEye, helpCircle: FiHelpCircle, home: FiHome, key: FiKey, layers: FiLayers, mail: FiMail,
  mapPin: FiMapPin, percent: FiPercent, phone: FiPhone, pound: FiPoundSign as IconType, rotateCcw: FiRotateCcw,
  search: FiSearch, settings: FiSettings, shield: FiShield, smartphone: FiSmartphone, star: FiStar, tool: FiTool, trendingUp: FiTrendingUp,
  user: FiUser, userCheck: FiUserCheck, users: FiUsers, alertTriangle: FiAlertTriangle,
};

/** An icon chosen in the CMS (falls back to a tick) */
export function CmsIcon({ name, ...props }: { name?: string } & IconBaseProps) {
  const Icon = ICONS[name as IconName] || FiCheckCircle;
  return <Icon {...props} />;
}
