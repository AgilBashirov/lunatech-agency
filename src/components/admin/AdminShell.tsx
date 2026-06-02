"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/cn";
import { StorageMeter } from "@/components/admin/StorageMeter";
import type { StorageUsage } from "@/lib/admin/blob";
import {
  LayoutDashboard,
  Briefcase,
  MessageSquare,
  Image as ImageIcon,
  FileText,
  LogOut,
  Menu,
  Tag,
  Settings,
  X,
} from "lucide-react";

// ---------------------------------------------------------------------------
// Nav items
// ---------------------------------------------------------------------------

type NavItem = {
  label: string;
  href: string;
  icon: React.ReactNode;
};

const NAV_ITEMS: NavItem[] = [
  {
    label: "Dashboard",
    href: "/admin",
    icon: <LayoutDashboard size={18} />,
  },
  {
    label: "Xidmətlər",
    href: "/admin/services",
    icon: <Briefcase size={18} />,
  },
  {
    label: "Məzmun",
    href: "/admin/messages",
    icon: <MessageSquare size={18} />,
  },
  {
    label: "Portfolio",
    href: "/admin/portfolio",
    icon: <ImageIcon size={18} />,
  },
  {
    label: "Blog",
    href: "/admin/blog",
    icon: <FileText size={18} />,
  },
  {
    label: "Əlaqə mövzuları",
    href: "/admin/contact-topics",
    icon: <Tag size={18} />,
  },
  {
    label: "Parametrlər",
    href: "/admin/settings",
    icon: <Settings size={18} />,
  },
];

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type AdminShellProps = {
  children: React.ReactNode;
  username: string;
  storageUsage: StorageUsage | null;
  onCleanup: () => Promise<{ deleted: number }>;
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function AdminShell({ children, username, storageUsage, onCleanup }: AdminShellProps) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const isActive = (href: string) => {
    if (href === "/admin") return pathname === "/admin";
    return pathname.startsWith(href);
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "#0a0a0a", color: "#f4f4f5" }}>
      {/* ------------------------------------------------------------------ */}
      {/* Topbar                                                               */}
      {/* ------------------------------------------------------------------ */}
      <header
        className="flex items-center justify-between px-4 h-14 border-b shrink-0"
        style={{ background: "#111111", borderColor: "rgba(255,255,255,0.08)" }}
      >
        {/* Left: hamburger + brand */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            aria-label="Menyunu aç / bağla"
            aria-expanded={sidebarOpen}
            className="lg:hidden p-1.5 rounded hover:bg-white/10 transition-colors"
            onClick={() => setSidebarOpen((prev) => !prev)}
          >
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
          <span className="text-sm font-semibold tracking-widest uppercase text-white/80 select-none">
            Lunatech Admin
          </span>
        </div>

        {/* Right: username + logout */}
        <div className="flex items-center gap-3">
          <span className="hidden sm:block text-xs text-white/40 select-none">
            {username}
          </span>
          <form action="/admin/logout" method="POST">
            <button
              type="submit"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium transition-colors hover:bg-white/10"
              style={{ color: "rgba(244,244,245,0.6)" }}
            >
              <LogOut size={14} />
              <span>Çıxış</span>
            </button>
          </form>
        </div>
      </header>

      {/* ------------------------------------------------------------------ */}
      {/* Body: sidebar + main                                                 */}
      {/* ------------------------------------------------------------------ */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar overlay (mobile) */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 z-20 lg:hidden"
            style={{ background: "rgba(0,0,0,0.6)" }}
            onClick={() => setSidebarOpen(false)}
            aria-hidden="true"
          />
        )}

        {/* Sidebar */}
        <aside
          className={cn(
            "fixed lg:static inset-y-0 left-0 z-30 w-56 flex flex-col border-r shrink-0 transition-transform duration-200 ease-in-out",
            "top-14 lg:top-0",
            sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
          )}
          style={{ background: "#111111", borderColor: "rgba(255,255,255,0.08)" }}
          aria-label="Admin panel naviqasiyası"
        >
          <nav className="flex-1 overflow-y-auto py-4 px-2">
            <ul className="space-y-0.5" role="list">
              {NAV_ITEMS.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={() => setSidebarOpen(false)}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors",
                      isActive(item.href)
                        ? "text-white"
                        : "text-white/50 hover:text-white/80 hover:bg-white/5",
                    )}
                    style={
                      isActive(item.href)
                        ? { background: "rgba(255,255,255,0.08)", color: "#f4f4f5" }
                        : undefined
                    }
                    aria-current={isActive(item.href) ? "page" : undefined}
                  >
                    <span className="shrink-0">{item.icon}</span>
                    <span>{item.label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {storageUsage && <StorageMeter usage={storageUsage} onCleanup={onCleanup} />}
        </aside>

        {/* Main content */}
        <main className="flex-1 overflow-y-auto" style={{ background: "#0f0f0f" }}>
          {children}
        </main>
      </div>
    </div>
  );
}
