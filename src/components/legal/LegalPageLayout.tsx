import { Footer } from "@/components/layout/Footer";
import { Navbar } from "@/components/layout/Navbar";
import { ScrollToTopButton } from "@/components/layout/ScrollToTopButton";
import { BackToHomeButton } from "@/components/services/detail/BackToHomeButton";

type Section = { heading: string; body: string };

type LegalPageLayoutProps = {
  title: string;
  updated: string;
  intro: string;
  sections: Section[];
};

/** Shared chrome + prose styling for the static legal pages (`/privacy`, `/terms`). */
export function LegalPageLayout({
  title,
  updated,
  intro,
  sections,
}: LegalPageLayoutProps) {
  return (
    <div className="relative flex min-h-full min-w-0 max-w-full flex-col">
      <Navbar />
      <main className="min-w-0 flex-1">
        <BackToHomeButton placement="top" />
        <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
          <header className="mb-10">
            <h1 className="text-3xl font-bold leading-tight text-white sm:text-4xl">
              {title}
            </h1>
            <p className="mt-4 text-sm text-text-tertiary">{updated}</p>
            <p className="mt-6 t-body text-text-secondary">{intro}</p>
          </header>
          <div className="flex flex-col gap-8">
            {sections.map((section) => (
              <section key={section.heading}>
                <h2 className="text-lg font-semibold text-white">
                  {section.heading}
                </h2>
                <p className="mt-2 t-body text-text-secondary">{section.body}</p>
              </section>
            ))}
          </div>
        </div>
        <BackToHomeButton placement="bottom" />
      </main>
      <Footer />
      <ScrollToTopButton />
    </div>
  );
}
