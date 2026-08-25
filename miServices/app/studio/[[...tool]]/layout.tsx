export const metadata = {
  title: 'miServices Studio',
  description: 'Content management for miServices',
};

export default function StudioLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div style={{ margin: 0, height: '100vh' }}>{children}</div>
  );
}
