"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";

export function DeleteReportsButton() {
  const [message, setMessage] = useState("");
  const [pending, setPending] = useState(false);

  async function deleteReports() {
    if (!window.confirm("Delete all saved analysis reports in this account? This cannot be undone. Your account will remain active.")) return;
    setPending(true);
    setMessage("");
    try {
      const response = await fetch("/api/analyses", { method: "DELETE" });
      const result = await response.json() as { deleted?: number; error?: string };
      if (!response.ok) throw new Error(result.error ?? "Saved reports could not be deleted.");
      setMessage(`${result.deleted ?? 0} saved report${result.deleted === 1 ? "" : "s"} deleted.`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Saved reports could not be deleted.");
    } finally {
      setPending(false);
    }
  }

  return (
    <div>
      <button className="button button-danger" disabled={pending} onClick={deleteReports} type="button">
        <Trash2 size={15} /> {pending ? "Deleting…" : "Delete all saved reports"}
      </button>
      {message && <p aria-live="polite" className="inline-feedback" role="status">{message}</p>}
    </div>
  );
}
