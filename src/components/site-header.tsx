import Link from "next/link";
import { ArrowUpRight, ScanSearch, Sparkles } from "lucide-react";
import type { ReactNode } from "react";

const links = [
  { href: "/#how-it-works", label: "How it works" },
  { href: "/jobs", label: "Career paths" },
  { href: "/learning", label: "Learning" },
];

export function SiteHeader({ compact = false }: { compact?: boolean }) {
  return (
    <header className="site-header">
      <Link aria-label="CareerLens AI home" className="brand" href="/">
        <span className="brand-mark"><ScanSearch size={19} strokeWidth={2.2} /></span>
        <span>CareerLens<span className="brand-accent">.</span><small>AI</small></span>
      </Link>
      {!compact && (
        <nav aria-label="Main navigation" className="main-nav">
          {links.map((link) => <Link href={link.href} key={link.href}>{link.label}</Link>)}
        </nav>
      )}
      <div className="header-actions">
        <Link className="header-login" href="/login">Sign in</Link>
        <Link className="button button-dark button-small" href="/analyze">
          Start a review <ArrowUpRight size={15} />
        </Link>
      </div>
    </header>
  );
}

export function Eyebrow({ children }: { children: ReactNode }) {
  return (
    <span className="eyebrow">
      <Sparkles aria-hidden="true" size={13} />
      {children}
    </span>
  );
}
