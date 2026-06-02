import type { ReactNode } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { ScrollToTopButton } from "@/components/layout/ScrollToTopButton";

export default function BlogLayout({ children }: { children: ReactNode }) {
  return (
    <div className="relative flex min-h-full flex-col">
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
      <ScrollToTopButton />
    </div>
  );
}
