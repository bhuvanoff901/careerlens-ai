import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowUpRight, FileText, Plus, Sparkles } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { ScoreVisual } from "@/components/score-visual";
import { analysisResultSchema } from "@/lib/analysis/schema";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Your dashboard" };
export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const supabase = await createSupabaseServerClient();
  if (!supabase) redirect("/login");
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) redirect("/login");

  const { data: rows, error } = await supabase
    .from("analyses")
    .select("id, title, created_at, report")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(50);

  return (
    <main className="app-page">
      <div className="site-container">
        <SiteHeader />
        <section className="dashboard-welcome">
          <div><span className="eyebrow"><Sparkles size={14} /> YOUR PRIVATE WORKSPACE</span><h1>A little more room to grow.</h1><p>Your saved reports stay connected to your account.</p></div>
          <Link className="button button-dark" href="/analyze"><Plus size={16} /> New analysis</Link>
        </section>
        {error ? (
          <div className="state-card" role="alert"><h2>Reports could not be loaded.</h2><p>Your account is signed in, but the saved report service did not respond. Please try again later.</p></div>
        ) : !rows?.length ? (
          <div className="empty-dashboard">
            <span className="empty-icon"><FileText size={22} /></span>
            <h2>Your first report will feel good here.</h2>
            <p>Analysis stays private and temporary until you choose to save a report.</p>
            <Link className="button button-dark" href="/analyze">Analyze a resume <ArrowUpRight size={16} /></Link>
          </div>
        ) : (
          <section aria-label="Saved resume analyses" className="saved-analysis-grid">
            {rows.map((row) => {
              const parsed = analysisResultSchema.safeParse(row.report);
              return (
                <Link className="saved-analysis-card" href={`/analysis/${row.id}`} key={row.id}>
                  <div className="saved-card-top"><span className="saved-card-icon"><FileText size={18} /></span><span>{new Date(row.created_at).toLocaleDateString()}</span></div>
                  <h2>{row.title}</h2>
                  <div className="saved-card-score">{parsed.success ? <ScoreVisual score={parsed.data.overallScore} size="small" /> : <span className="muted-copy">Report format unavailable</span>}<span>Advisory feedback score</span></div>
                  <span className="text-button">Open report <ArrowUpRight size={15} /></span>
                </Link>
              );
            })}
          </section>
        )}
        <p className="privacy-footnote">Only you can access your saved reports. You can delete them in <Link href="/settings">privacy settings</Link>.</p>
      </div>
    </main>
  );
}
