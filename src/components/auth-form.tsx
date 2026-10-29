"use client";

import Link from "next/link";
import { useActionState } from "react";
import { ArrowLeft, ArrowRight, LockKeyhole } from "lucide-react";
import { signInAction, signUpAction, type AuthActionState } from "@/app/auth-actions";
import { Button } from "@/components/ui/button";

const initialState: AuthActionState = {};

export function AuthForm({ mode }: { mode: "login" | "signup" }) {
  const action = mode === "login" ? signInAction : signUpAction;
  const [state, formAction, pending] = useActionState(action, initialState);
  const isSignup = mode === "signup";

  return (
    <main className="auth-page">
      <Link className="auth-back" href="/"><ArrowLeft size={15} /> Back to CareerLens</Link>
      <section className="auth-panel" aria-labelledby="auth-heading">
        <div className="auth-mark"><LockKeyhole size={18} /></div>
        <span className="section-kicker">{isSignup ? "YOUR PRIVATE WORKSPACE" : "WELCOME BACK"}</span>
        <h1 id="auth-heading">{isSignup ? "Make room to grow." : "Pick up where you left off."}</h1>
        <p>{isSignup ? "Create an account to save your analysis reports privately." : "Sign in to see the reports you chose to save."}</p>
        <form action={formAction} className="auth-form">
          {isSignup && (
            <>
              <label htmlFor="auth-display-name">Your name</label>
              <input autoComplete="name" id="auth-display-name" maxLength={100} name="displayName" required />
            </>
          )}
          <label htmlFor="auth-email">Email address</label>
          <input autoComplete="email" id="auth-email" maxLength={254} name="email" required type="email" />
          <label htmlFor="auth-password">Password</label>
          <input
            autoComplete={isSignup ? "new-password" : "current-password"}
            id="auth-password"
            maxLength={128}
            minLength={8}
            name="password"
            required
            type="password"
          />
          {state.error && <p className="form-error" role="alert">{state.error}</p>}
          {state.success && <p className="form-success" role="status">{state.success}</p>}
          <Button className="auth-submit" disabled={pending} size="sm" type="submit">
            {pending ? "Please wait…" : isSignup ? "Create account" : "Sign in"}
            <ArrowRight size={16} />
          </Button>
        </form>
        <p className="auth-switch">
          {isSignup ? "Already have an account?" : "New to CareerLens?"}{" "}
          <Link href={isSignup ? "/login" : "/signup"}>{isSignup ? "Sign in" : "Create an account"}</Link>
        </p>
        <p className="auth-demo-note">No account needed to explore the <Link href="/analysis/demo">fictional demo report</Link>.</p>
      </section>
    </main>
  );
}
