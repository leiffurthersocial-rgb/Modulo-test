import Link from "next/link";
import { Wordmark } from "./Wordmark";

export function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-ink-800">
      <div className="mx-auto max-w-6xl px-5 py-10 sm:px-8">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
          <div className="max-w-md space-y-3">
            <Wordmark />
            <p className="text-[12.5px] leading-relaxed text-fog-400">
              Modulo: Test is an unsupervised practice assessment. It is not a clinically
              validated IQ test, and the Modulo archetypes are our own construction rather
              than an established personality typology. Results are stored only in this
              browser.
            </p>
          </div>
          <nav className="flex flex-wrap gap-x-6 gap-y-2 text-[13px] text-fog-300">
            <Link href="/tests" className="hover:text-fog-100">IQ tests</Link>
            <Link href="/personality" className="hover:text-fog-100">Personality</Link>
            <Link href="/history" className="hover:text-fog-100">History</Link>
            <Link href="/about" className="hover:text-fog-100">Method</Link>
          </nav>
        </div>
        <p className="mt-8 text-[12px] text-fog-400">
          © {new Date().getFullYear()} Modulo
        </p>
      </div>
    </footer>
  );
}
