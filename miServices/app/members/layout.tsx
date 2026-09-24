import MembersNav from '@/components/members/MembersNav';

/** Franchise Login pages: shared top navigation (hidden on the login page). */
export default function MembersLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <MembersNav />
      {children}
    </>
  );
}
