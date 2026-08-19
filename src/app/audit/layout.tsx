import AdminLayout from '@/components/layout/AdminLayout';

export default function AuditLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AdminLayout>{children}</AdminLayout>;
}
