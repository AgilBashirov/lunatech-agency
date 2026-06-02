import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import { getAdminSession } from "@/lib/admin/session";
import { AdminShell } from "@/components/admin/AdminShell";
import { getStorageUsage } from "@/lib/admin/blob";
import { cleanupOrphanedBlobs } from "@/app/admin/(protected)/actions";

type Props = {
  children: ReactNode;
};

export default async function ProtectedAdminLayout({ children }: Props) {
  const [session, storageUsage] = await Promise.all([
    getAdminSession(),
    getStorageUsage(),
  ]);

  if (!session) {
    redirect("/admin/login");
  }

  return (
    <AdminShell
      username={session.username}
      storageUsage={storageUsage}
      onCleanup={cleanupOrphanedBlobs}
    >
      {children}
    </AdminShell>
  );
}
