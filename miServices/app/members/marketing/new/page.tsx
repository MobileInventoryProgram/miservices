import { companyDetails, listOptions } from '@/lib/marketing/campaigns';
import Composer from '../Composer';
import { adminOnly } from '../guard';

export const dynamic = 'force-dynamic';

export default async function NewCampaignPage() {
  const session = await adminOnly();
  const [company, lists] = await Promise.all([companyDetails(), listOptions()]);
  return (
    <Composer
      initial={{ id: null, name: '', list: 'customers', subject: '', previewText: '', blocks: [] }}
      company={company}
      lists={lists}
      adminFirstName={(session.user.name || '').split(' ')[0] || 'there'}
      adminEmail={session.user.email || ''}
    />
  );
}
