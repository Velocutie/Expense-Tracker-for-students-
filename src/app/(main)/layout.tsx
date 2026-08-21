'use client';

import { StoreProvider } from "@/lib/store";
import { AuthGuard } from "@/components/AuthGuard";
import { Sidebar } from "@/components/Sidebar";
import { usePathname } from "next/navigation";

function InnerLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  return (
    <div className="flex h-full">
      <Sidebar />
      <main className="flex-1 overflow-auto p-4 md:p-6 lg:p-8 pt-16 md:pt-6 pb-24 md:pb-6">
        <div key={pathname} className="page-transition">
          {children}
        </div>
      </main>
    </div>
  );
}

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <StoreProvider>
      <AuthGuard>
        <InnerLayout>{children}</InnerLayout>
      </AuthGuard>
    </StoreProvider>
  );
}
