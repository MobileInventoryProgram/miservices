import { Metadata } from 'next';
import LoginForm from './LoginForm';
import { getMembersText } from '@/lib/cms/members';

export const metadata: Metadata = {
  title: 'Sign in | Members Area | miServices',
};

export default async function LoginPage() {
  return <LoginForm text={(await getMembersText()).login || {}} />;
}
