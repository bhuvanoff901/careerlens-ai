import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { AnalysisReport } from "@/components/analysis-report";
import { SiteHeader } from "@/components/site-header";
import { demoAnalysis } from "@/lib/analysis/demo";
import { analysisResultSchema } from "@/lib/analysis/schema";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Resume analysis report" };

export default async function AnalysisPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  if (id === "demo") {
    return (
      <main className="app-page report-page">
        <div className="site-container">
          <SiteHeader compact />
          <div className="page-heading report-page-heading">
            <Link className="breadcrumb-link" href="/"><span aria-hidden="true">←</span> CareerLens</Link>
            <span className="eyebrow">FICTIONAL SAMPLE · NO ACCOUNT NEEDED</span>
            <h1>A sample review, from start to next step.</h1>
            <p>This example is fictional. It is included to show the report format, not as live AI output.</p>
          </div>
          <AnalysisReport report={demoAnalysis} saved />
        </div>
      </main>
    );
  }

  const supabase = await createSupabaseServerClient();
  if (!supabase) redirect("/login");
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) redirect("/login");

  const { data, error } = await supabase
    .from("analyses")
    .select("id, title, report, created_at")
    .eq("id", id)
    .eq("user_id", user.id)
    .maybeSingle();
  if (error || !data) notFound();

  const report = analysisResultSchema.safeParse(data.report);
  if (!report.success) notFound();

  return (
    <main className="app-page report-page">
      <div className="site-container">
        <SiteHeader compact />
        <div className="page-heading report-page-heading">
          <Link className="breadcrumb-link" href="/dashboard"><span aria-hidden="true">←</span> Your dashboard</Link>
          <span className="eyebrow">PRIVATELY SAVED REPORT</span>
          <h1>{data.title}</h1>
          <p>Saved on {new Date(data.created_at).toLocaleDateString()} · Resume text was not stored with this report.</p>
        </div>
        <AnalysisReport report={report.data} saved />
      </div>
    </main>
  );
}
