import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "CareerLens AI — Your resume deserves a closer look",
    template: "%s · CareerLens AI",
  },
  description:
    "Thoughtful, evidence-based resume feedback and practical career exploration. Advisory guidance, not a hiring decision.",
  applicationName: "CareerLens AI",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" data-scroll-behavior="smooth">
      <body>{children}</body>
    </html>
  );
}
