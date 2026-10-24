import { AuthGuard } from "@/components/auth-guard";
import { DashboardA11yEnhancer } from "@/components/dashboard/DashboardA11yEnhancer";
import { RoleGuard } from "@/components/dashboard/RoleGuard";

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <AuthGuard>
      <DashboardA11yEnhancer />
      <RoleGuard>{children}</RoleGuard>
    </AuthGuard>
  );
}
