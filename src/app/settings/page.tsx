import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft, Database, Fingerprint, ShieldCheck } from "lucide-react";
import { DeleteReportsButton } from "@/components/delete-reports-button";
import { SiteHeader } from "@/components/site-header";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Privacy & settings" };
export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const supabase = await createSupabaseServerClient();
  if (!supabase) redirect("/login");
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) redirect("/login");

  return (
    <main className="app-page">
      <div className="site-container">
        <SiteHeader />
        <section className="page-heading">
          <Link className="breadcrumb-link" href="/dashboard"><ArrowLeft size={14} /> Dashboard</Link>
          <span className="eyebrow"><ShieldCheck size={14} /> YOUR DATA, YOUR CHOICE</span>
          <h1>Privacy & settings.</h1>
          <p>Understand what CareerLens processes and control reports you chose to save.</p>
        </section>
        <div className="settings-stack">
          <section className="settings-card">
            <span className="settings-icon"><Fingerprint size={19} /></span>
            <div><span className="section-kicker">ACCOUNT</span><h2>Your sign-in</h2><p>Signed in as <strong>{user.email}</strong>. Authentication is managed by Supabase Auth using server-side cookie sessions.</p></div>
          </section>
          <section className="settings-card">
            <span className="settings-icon"><Database size={19} /></span>
            <div><span className="section-kicker">REPORT RETENTION</span><h2>Saved reports</h2><p>Raw resume files and pasted resume text are not saved. A report you explicitly save may contain derived personal information such as extracted skill evidence and rewritten examples. Deleting reports removes those report rows from this application; it does not delete your Supabase account.</p><DeleteReportsButton /></div>
          </section>
          <section className="settings-card privacy-details">
            <span className="settings-icon"><ShieldCheck size={19} /></span>
            <div><span className="section-kicker">PROCESSING</span><h2>How analysis works</h2><p>Uploaded files are extracted temporarily on the server and not retained. If an OpenAI key is configured, the app sends the resume text to OpenAI after removing obvious email and phone patterns. Without the key, a local text-cue preview is used and is labeled accordingly. Do not upload information you do not have permission to share.</p><p>This is advisory career-writing feedback, not an employment decision or a guarantee of success. Protected or irrelevant traits are not part of the scoring rubric.</p><Link className="inline-link" href="/analysis/demo">Explore the fictional demo ↗</Link></div>
          </section>
        </div>
      </div>
    </main>
  );
}
