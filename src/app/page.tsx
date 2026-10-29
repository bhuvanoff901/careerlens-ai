import Link from "next/link";
import {
  ArrowDown,
  ArrowRight,
  ArrowUpRight,
  BadgeCheck,
  BookOpenCheck,
  BriefcaseBusiness,
  ChartNoAxesCombined,
  Check,
  ChevronDown,
  Fingerprint,
  Lightbulb,
  ScanSearch,
  Sparkles,
  Target,
} from "lucide-react";
import { DemoEntry } from "@/components/demo-entry";
import { Eyebrow, SiteHeader } from "@/components/site-header";
import { ScoreVisual } from "@/components/score-visual";
import { demoAnalysis } from "@/lib/analysis/demo";

const features = [
  { icon: ChartNoAxesCombined, number: "01", title: "A clearer picture", text: "See resume feedback across a transparent rubric—not a mysterious black-box verdict." },
  { icon: Target, number: "02", title: "Skills with evidence", text: "Connect skills to the words and project examples that actually appear in the document." },
  { icon: BriefcaseBusiness, number: "03", title: "Roles to explore", text: "Discover career directions with an explanation of what might transfer and what to learn next." },
  { icon: BookOpenCheck, number: "04", title: "A next-step plan", text: "Turn a broad goal into an approachable learning sequence and a small project idea." },
];

const faqs = [
  { question: "Is the resume score a hiring decision?", answer: "No. It is advisory writing feedback based only on the supplied text. It cannot determine a candidate's suitability, guarantee interviews, or make hiring decisions." },
  { question: "Do you store my resume?", answer: "Resume files and pasted text are processed for the current request and are not saved by default. You can explicitly save a report to a configured Supabase account; reports may contain derived personal information. The demo uses fictional sample data." },
  { question: "Does the tool test every ATS?", answer: "No. It can offer general formatting and readability suggestions, but it does not claim to test compatibility with every applicant tracking system." },
  { question: "What if I do not have an account or AI key?", answer: "You can explore the clearly labeled fictional sample. Without an OpenAI key, resume submissions use a local text-cue preview—not live AI analysis." },
];

function DashboardPreview() {
  return (
    <div aria-label="Illustrative resume analysis dashboard preview" className="dashboard-preview">
      <div className="preview-toolbar">
        <div className="preview-window-dots"><i /><i /><i /></div>
        <span>YOUR CAREER SNAPSHOT</span>
        <span className="preview-date">SAMPLE</span>
      </div>
      <div className="preview-body">
        <div className="preview-welcome">
          <div><small>MONDAY, MAY 12</small><h2>A good next step starts here.</h2><p>A sample view of practical resume feedback.</p></div>
          <span className="preview-avatar">J</span>
        </div>
        <div className="preview-metrics">
          <div className="preview-score-card">
            <div><small>RESUME QUALITY</small><strong>{demoAnalysis.overallScore}<span>/100</span></strong><em><Check size={12} /> SAMPLE SCORE</em></div>
            <ScoreVisual score={demoAnalysis.overallScore} size="small" />
          </div>
          <div className="preview-insight-card">
            <small>TOP STRENGTH</small>
            <strong>Project evidence</strong>
            <span>Academic experience counts.</span>
            <div className="preview-mini-bars"><i /><i /><i /><i /><i /></div>
          </div>
        </div>
        <div className="preview-bottom">
          <span><span className="preview-dot" /> 3 skills with evidence</span>
          <span><span className="preview-dot violet" /> 2 learning ideas</span>
          <ArrowUpRight size={16} />
        </div>
      </div>
      <div className="preview-float-chip"><Sparkles size={14} /> A plan, not a verdict</div>
    </div>
  );
}

export default function Home() {
  return (
    <main>
      <section className="hero-section">
        <div className="site-container">
          <SiteHeader />
          <div className="hero-grid">
            <div className="hero-copy">
              <Eyebrow>CAREER CLARITY, ONE STEP AT A TIME</Eyebrow>
              <h1>Your resume deserves <span>more than a quick glance.</span></h1>
              <p className="hero-description">
                Thoughtful feedback on the skills, projects, and possibilities already in your story. Get useful next steps—with your facts left intact.
              </p>
              <div className="hero-ctas">
                <Link className="button button-dark" href="/analyze">Analyze my resume <ArrowRight size={16} /></Link>
                <Link className="button button-light" href="/analysis/demo">Explore demo <ArrowUpRight size={16} /></Link>
              </div>
              <div className="hero-trust"><Fingerprint size={16} /><span>Private by default</span><i /><span>Never a hiring decision</span></div>
              <a className="scroll-cue" href="#how-it-works"><ArrowDown size={14} /> See how it works</a>
            </div>
            <DashboardPreview />
          </div>
          <div className="hero-bottom-line">
            <span>BUILT FOR THE NEXT CHAPTER</span>
            <span className="hero-bottom-rule" />
            <span>STUDENTS · CAREER CHANGERS · CURIOUS MINDS</span>
          </div>
        </div>
      </section>

      <section className="trust-strip">
        <div className="site-container trust-strip-inner">
          <span><BadgeCheck size={16} /> Feedback grounded in resume evidence</span>
          <span><Fingerprint size={16} /> Your file is not stored by default</span>
          <span><Lightbulb size={16} /> Suggestions, not decisions</span>
        </div>
      </section>

      <section className="section-padding feature-section" id="features">
        <div className="site-container">
          <div className="section-intro">
            <Eyebrow>A BETTER WAY TO TAKE STOCK</Eyebrow>
            <h2>Make the next move <span>feel a little clearer.</span></h2>
            <p>CareerLens brings your experience into focus and gives you a practical place to begin.</p>
          </div>
          <div className="feature-grid">
            {features.map(({ icon: Icon, number, title, text }) => (
              <article className="feature-card" key={number}>
                <div className="feature-card-top"><span className="feature-icon"><Icon size={20} /></span><span>{number}</span></div>
                <h3>{title}</h3><p>{text}</p>
                <span className="feature-card-rule" />
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section-padding steps-section" id="how-it-works">
        <div className="site-container steps-layout">
          <div className="steps-heading">
            <Eyebrow>THREE SMALL STEPS</Eyebrow>
            <h2>From “what now?” to a plan.</h2>
            <p>No complicated setup. Start with the story you already have.</p>
            <Link className="text-button" href="/analyze">Start your review <ArrowRight size={15} /></Link>
          </div>
          <div className="steps-list">
            {[
              ["01", "Bring your resume", "Paste text or upload a PDF/DOCX. Your original file is not stored."],
              ["02", "Review the evidence", "See a transparent rubric and suggestions grounded in the text."],
              ["03", "Choose what comes next", "Explore roles, learning topics, and small project ideas at your pace."],
            ].map(([number, title, description]) => (
              <article className="step-row" key={number}><span>{number}</span><div><h3>{title}</h3><p>{description}</p></div><ArrowUpRight size={17} /></article>
            ))}
          </div>
        </div>
      </section>

      <section className="section-padding sample-section">
        <div className="site-container sample-layout">
          <div className="sample-copy">
            <Eyebrow>TAKE A LOOK AROUND</Eyebrow>
            <h2>Good guidance starts with <span>good questions.</span></h2>
            <p>Explore a complete report built from a fictional early-career resume. No account, upload, or API key needed—and the sample is clearly labeled.</p>
            <Link className="button button-dark" href="/analysis/demo">Explore the sample report <ArrowRight size={16} /></Link>
          </div>
          <DemoEntry />
        </div>
      </section>

      <section className="section-padding responsible-section">
        <div className="site-container responsible-card">
          <div className="responsible-icon"><Fingerprint size={24} /></div>
          <div><Eyebrow>BUILT WITH CARE</Eyebrow><h2>Your story is yours.</h2><p>We treat resumes as sensitive personal information. CareerLens is an advisory tool—not an automated hiring or rejection system. We do not invent candidate achievements, promise ATS outcomes, or save your resume by default.</p></div>
          <ul><li><Check size={15} /> Files processed temporarily</li><li><Check size={15} /> No protected-trait scoring</li><li><Check size={15} /> Opt-in report saving</li></ul>
        </div>
      </section>

      <section className="section-padding faq-section" id="faq">
        <div className="site-container faq-layout">
          <div><Eyebrow>GOOD TO KNOW</Eyebrow><h2>A few honest answers.</h2><p>Career advice should come with clarity about its limits.</p></div>
          <div className="faq-list">
            {faqs.map((faq) => (
              <details key={faq.question}><summary>{faq.question}<ChevronDown size={17} /></summary><p>{faq.answer}</p></details>
            ))}
          </div>
        </div>
      </section>

      <section className="closing-cta">
        <div className="site-container closing-cta-inner">
          <div><span className="section-kicker">YOUR NEXT CHAPTER IS YOURS TO WRITE</span><h2>Make one good move today.</h2></div>
          <Link className="button button-white" href="/analyze">Start with your resume <ArrowRight size={16} /></Link>
        </div>
      </section>

      <footer className="site-footer">
        <div className="site-container footer-inner">
          <Link aria-label="CareerLens AI home" className="brand footer-brand" href="/"><span className="brand-mark"><ScanSearch size={18} /></span><span>CareerLens<span className="brand-accent">.</span><small>AI</small></span></Link>
          <p>Thoughtful career exploration. Not a hiring decision.</p>
          <nav aria-label="Footer navigation"><Link href="/analyze">Analyze</Link><Link href="/jobs">Career paths</Link><Link href="/learning">Learning</Link><Link href="/settings">Privacy</Link></nav>
          <span className="footer-copy">© {new Date().getFullYear()} CareerLens AI · Demo-ready</span>
        </div>
      </footer>
    </main>
  );
}
