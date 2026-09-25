import LoginForm from './LoginForm';
import { getMembersText } from '@/lib/cms/members';

export default async function LoginPage() {
  return <LoginForm text={(await getMembersText()).login || {}} />;
}
