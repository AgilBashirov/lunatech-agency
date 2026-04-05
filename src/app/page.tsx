import { redirect } from "next/navigation";
import { routing } from "@/i18n/routing";

/** Fallback when `/` is hit without locale prefix (proxy should redirect first). */
export default function RootPage() {
  redirect(`/${routing.defaultLocale}`);
}
