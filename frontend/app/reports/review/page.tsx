"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, FileClock, Loader2, MessageSquare, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { fetchAllReports, getReportById, reviewReport } from "@/data/report/data";
import { useAuth } from "@/contexts/auth-context";
import { Report, ReportVersion } from "@/types/report";

const managerRoles = ["manager", "admin"];

function formatDate(value?: string) {
  if (!value) return "Unknown date";
  return new Date(value).toLocaleString();
}

export default function ReviewReportsPage() {
  const { user, isLoading: authLoading } = useAuth();
  const [reports, setReports] = useState<Report[]>([]);
  const [selected, setSelected] = useState<Report | null>(null);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const loadReports = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await fetchAllReports();
      if (!response.success) throw new Error(response.error ?? "Failed to load reports.");
      setReports((response.data ?? []).filter((report) => report.status === "Submitted"));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load reports.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading && user?.role && managerRoles.includes(user.role)) loadReports();
    if (!authLoading && (!user || !managerRoles.includes(user.role ?? ""))) setLoading(false);
  }, [authLoading, user]);

  const selectReport = async (report: Report) => {
    if (!report.id) return;
    setError("");
    try {
      const response = await getReportById(report.id);
      if (!response.success || !response.data) throw new Error(response.error ?? "Failed to load report.");
      setSelected(response.data);
      setComment("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load report.");
    }
  };

  const handleReview = async (status: "Approved" | "Needs Correction") => {
    if (!selected?.id) return;
    if (status === "Needs Correction" && !comment.trim()) {
      setError("Add a general comment explaining what needs correction.");
      return;
    }

    setSaving(true);
    setError("");
    try {
      const response = await reviewReport(selected.id, status, comment.trim() || undefined);
      if (!response.success) throw new Error(response.error ?? "Failed to update report review.");
      setSelected(null);
      setComment("");
      await loadReports();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update report review.");
    } finally {
      setSaving(false);
    }
  };

  if (authLoading || loading) {
    return <div className="flex flex-1 items-center justify-center gap-2 p-6 text-sm text-muted-foreground"><Loader2 className="animate-spin" /> Loading reports...</div>;
  }

  if (!user || !managerRoles.includes(user.role ?? "")) {
    return <div className="p-6 text-sm text-destructive">You do not have permission to review reports.</div>;
  }

  return (
    <div className="flex-1 space-y-6 p-6 text-foreground">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Reports To Review</h1>
        <p className="text-muted-foreground">Review submitted reports without changing the team member&apos;s content.</p>
      </div>

      {error && <div className="rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">{error}</div>}

      {selected ? (
        <Card>
          <CardHeader className="flex flex-row items-start justify-between gap-4">
            <div>
              <CardTitle>{selected.project_tag || "Weekly report"}</CardTitle>
              <p className="mt-1 text-sm text-muted-foreground">Week of {selected.week_start} to {selected.week_end} · Version {selected.version_number ?? 1}</p>
            </div>
            <Button variant="ghost" size="icon" onClick={() => setSelected(null)} aria-label="Close report"><X /></Button>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <div><h2 className="font-semibold">Tasks</h2><ul className="mt-2 list-disc space-y-1 pl-5 text-sm">{(selected.tasks ?? []).map((task, index) => <li key={task.id ?? index}>{task.task_name} ({task.status})</li>)}</ul></div>
              <div><h2 className="font-semibold">Next week</h2><p className="mt-2 whitespace-pre-wrap text-sm text-muted-foreground">{selected.tasks_planned_next_week || "No plan provided."}</p></div>
            </div>
            <div className="grid gap-4 md:grid-cols-2"><div><h2 className="font-semibold">Achievements</h2><p className="mt-2 text-sm text-muted-foreground">{(selected.achievements ?? []).join("; ") || "None"}</p></div><div><h2 className="font-semibold">Blockers</h2><p className="mt-2 text-sm text-muted-foreground">{(selected.blockers ?? []).join("; ") || "None"}</p></div></div>

            <VersionList versions={selected.versions ?? []} />

            <div className="space-y-3 border-t pt-5">
              <label htmlFor="review-comment" className="flex items-center gap-2 font-semibold"><MessageSquare className="h-4 w-4" /> Review comment</label>
              <Textarea id="review-comment" value={comment} onChange={(event) => setComment(event.target.value)} placeholder="Explain what needs correction if sending this report back." />
              <div className="flex flex-wrap justify-end gap-3"><Button variant="outline" disabled={saving} onClick={() => handleReview("Needs Correction")}>Request Changes</Button><Button disabled={saving} onClick={() => handleReview("Approved")}><CheckCircle2 /> Approve</Button></div>
            </div>
          </CardContent>
        </Card>
      ) : reports.length === 0 ? (
        <Card><CardContent className="p-10 text-center text-sm text-muted-foreground">No submitted reports are waiting for review.</CardContent></Card>
      ) : (
        <div className="grid gap-4">{reports.map((report) => <Card key={report.id}><CardContent className="flex flex-wrap items-center justify-between gap-4 p-5"><div><p className="font-semibold">{report.project_tag || "Weekly report"}</p><p className="text-sm text-muted-foreground">{report.week_start} to {report.week_end}</p></div><Button onClick={() => selectReport(report)}>Review report</Button></CardContent></Card>)}</div>
      )}
    </div>
  );
}

function VersionList({ versions }: { versions: ReportVersion[] }) {
  if (!versions.length) return null;
  return <section className="space-y-3 border-t pt-5"><h2 className="flex items-center gap-2 font-semibold"><FileClock className="h-4 w-4" /> Previous versions</h2><div className="space-y-2">{versions.map((version, index) => <details key={version.id ?? version.version_number ?? index} className="rounded-md border p-3"><summary className="cursor-pointer text-sm font-medium">Version {version.version_number ?? index + 1} · {version.status ?? "Unknown"} · {formatDate(version.submitted_at ?? version.created_at)}</summary><p className="mt-2 text-sm text-muted-foreground">{version.review_comment || "No review comment recorded."}</p></details>)}</div></section>;
}
