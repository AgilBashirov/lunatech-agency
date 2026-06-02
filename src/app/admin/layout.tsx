import type { ReactNode } from "react";

/**
 * Admin root layout.
 *
 * The root app/layout.tsx already provides <html> and <body>.
 * This layout is a minimal wrapper shared by every /admin/* route.
 * Session guarding lives in the (protected) segment layout so that
 * /admin/login can render without being redirected.
 */
type Props = {
  children: ReactNode;
};

export default function AdminLayout({ children }: Props) {
  return <>{children}</>;
}
