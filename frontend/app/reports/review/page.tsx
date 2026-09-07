"use client";

import { useEffect, useState } from "react";
import {
  CheckCircle2,
  FileClock,
  Loader2,
  MessageSquare,
  X,
} from "lucide-react";

import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import {
  fetchAllReports,
  getReportById,
  reviewReport,
} from "@/data/report/data";
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
  const [commentError, setCommentError] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const loadReports = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await fetchAllReports();
      if (!response.success)
        throw new Error(response.error ?? "Failed to load reports.");
      setReports(
        (response.data ?? []).filter((report) => report.status === "Submitted"),
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load reports.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (authLoading) return;

    if (!user || !managerRoles.includes(user.role ?? "")) {
      return;
    }

    let isMounted = true;

    const runLoadReports = async () => {
      setLoading(true);
      setError("");
      try {
        const response = await fetchAllReports();
        if (!response.success) {
          throw new Error(response.error ?? "Failed to load reports.");
        }

        if (!isMounted) return;

        setReports(
          (response.data ?? []).filter((report) => report.status === "Submitted"),
        );
      } catch (err) {
        if (!isMounted) return;
        setError(err instanceof Error ? err.message : "Failed to load reports.");
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    void runLoadReports();

    return () => {
      isMounted = false;
    };
  }, [authLoading, user]);

  const selectReport = async (report: Report) => {
    if (!report.id) return;
    setError("");
    setCommentError("");
    try {
      const response = await getReportById(report.id);
      if (!response.success || !response.data)
        throw new Error(response.error ?? "Failed to load report.");
      setSelected(response.data);
      setComment("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load report.");
    }
  };

  const handleReview = async (status: "Approved" | "Needs Correction") => {
    if (!selected?.id) return;
    if (status === "Needs Correction" && !comment.trim()) {
      setCommentError("Add a general comment explaining what needs correction.");
      return;
    }

    setCommentError("");
    setSaving(true);
    setError("");
    try {
      const response = await reviewReport(
        selected.id,
        status,
        comment.trim() || undefined,
      );
      if (!response.success)
        throw new Error(response.error ?? "Failed to update report review.");

      toast.success(
        status === "Approved"
          ? "Report approved successfully."
          : "Changes requested successfully.",
      );

      setSelected(null);
      setComment("");
      await loadReports();
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to update report review.";
      setError(message);
      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex-1 space-y-6 p-6 text-foreground">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Reports To Review</h1>
        <p className="text-muted-foreground">
          Review submitted reports without changing the team member&apos;s
          content.
        </p>
      </div>

      {error && (
        <div className="rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </div>
      )}

      

      {selected ? (
        <Card className="w-full !max-w-[900px] p-0 mx-auto gap-0">
          <CardHeader className="bg-accent p-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <CardTitle className="text-lg">
                  {selected.project_tag || "Weekly report"}
                </CardTitle>
                <p className="mt-1 text-sm text-muted-foreground">
                  Week of {selected.week_start} to {selected.week_end} · Version{" "}
                  {selected.version_number ?? 1}
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSelected(null)}
                aria-label="Close report"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>

          <CardContent className="space-y-6 p-5">
            <div className="flex gap-5 items-start flex-wrap">
              <div className="flex flex-col gap-1 flex-1 min-w-[200px]">
                <Label>Week Starting</Label>
                <Input value={selected.week_start ?? ""} readOnly />
              </div>

              <div className="flex flex-col gap-1 flex-1 min-w-[200px]">
                <Label>Week Ending</Label>
                <Input value={selected.week_end ?? ""} readOnly />
              </div>

              <div className="flex flex-col gap-1 flex-1 min-w-[200px]">
                <Label>Project/Category</Label>
                <Input value={selected.project_tag ?? ""} readOnly />
              </div>
            </div>

            <div className="space-y-3">
              <h2 className="text-base font-semibold">Tasks Completed</h2>
              <div className="overflow-x-auto rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Task</TableHead>
                      <TableHead>Priority</TableHead>
                      <TableHead>Planned %</TableHead>
                      <TableHead>Actual %</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Hrs. Planned</TableHead>
                      <TableHead>Hrs. Spent</TableHead>
                      <TableHead>Output</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(selected.tasks ?? []).map((task, index) => (
                      <TableRow key={task.id ?? `${task.task_name ?? "task"}-${index}`}>
                        <TableCell>{task.task_name || "—"}</TableCell>
                        <TableCell>{task.priority || "Medium"}</TableCell>
                        <TableCell>{task.planned_percentage ?? "—"}</TableCell>
                        <TableCell>{task.actual_percentage ?? "—"}</TableCell>
                        <TableCell>{task.status || "Not Started"}</TableCell>
                        <TableCell>{task.time_planned_hours ?? "—"}</TableCell>
                        <TableCell>{task.time_spent_hours ?? "—"}</TableCell>
                        <TableCell>{task.deliverable_output || "—"}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>

            <div className="space-y-3">
              <Label>Tasks Planned for Next Week</Label>
              <Textarea
                value={selected.tasks_planned_next_week || "No plan provided."}
                readOnly
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-3">
                <h2 className="text-sm font-semibold">Blockers / Challenges</h2>
                <div className="space-y-2 rounded-md border p-3">
                  {(selected.blockers ?? []).length ? (
                    (selected.blockers ?? []).map((blocker, index) => (
                      <div key={`${blocker}-${index}`} className="text-sm text-muted-foreground">
                        {blocker || "—"}
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground">No blockers reported.</p>
                  )}
                </div>
              </div>

              <div className="space-y-3">
                <h2 className="text-sm font-semibold">Key Achievements</h2>
                <div className="space-y-2 rounded-md border p-3">
                  {(selected.achievements ?? []).length ? (
                    (selected.achievements ?? []).map((achievement, index) => (
                      <div key={`${achievement}-${index}`} className="text-sm text-muted-foreground">
                        {achievement || "—"}
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground">No achievements added.</p>
                  )}
                </div>
              </div>
            </div>

            {selected.time_breakdowns?.length ? (
              <div className="space-y-3">
                <h2 className="text-sm font-semibold">Hours Breakdown</h2>
                <div className="grid gap-4 md:grid-cols-4 sm:grid-cols-2">
                  {(
                    [
                      "Development",
                      "Testing",
                      "Meetings",
                      "Documentation",
                    ] as const
                  ).map((type) => {
                    const item = selected.time_breakdowns?.find(
                      (entry) => entry.task_type === type,
                    );

                    return (
                      <div key={type} className="rounded-md border p-3">
                        <p className="text-xs text-muted-foreground">{type}</p>
                        <p className="mt-2 text-lg font-semibold">
                          {item?.hours_spent ?? 0}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : null}

            <div className="space-y-3">
              <Label>Notes or Links</Label>
              <Textarea value={selected.notes_or_links || ""} readOnly />
            </div>

            <VersionList versions={selected.versions ?? []} />

            <div className="space-y-3 border-t pt-5">
              <label
                htmlFor="review-comment"
                className="flex items-center gap-2 font-semibold"
              >
                <MessageSquare className="h-4 w-4" /> Review comment
              </label>
              <Textarea
                id="review-comment"
                value={comment}
                onChange={(event) => {
                  setComment(event.target.value);
                  if (commentError) setCommentError("");
                }}
                placeholder="Explain what needs correction if sending this report back."
                className={commentError ? "border-red-500 focus-visible:ring-red-500" : ""}
              />
              {commentError && (
                <p className="text-xs font-medium text-red-600">{commentError}</p>
              )}
              <div className="flex flex-wrap justify-end gap-3">
                <Button
                  variant="outline"
                  disabled={saving}
                  onClick={() => handleReview("Needs Correction")}
                >
                  Request Changes
                </Button>
                <Button
                  disabled={saving}
                  onClick={() => handleReview("Approved")}
                >
                  <CheckCircle2 className="h-4 w-4" /> Approve
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : authLoading || loading ? (
        <div className="flex flex-1 items-center justify-center gap-2 p-6 text-sm text-muted-foreground">
          <Loader2 className="animate-spin" /> Loading reports...
        </div>
      ) : !user || !managerRoles.includes(user.role ?? "") ? (
        <div className="rounded-md border border-destructive/30 bg-destructive/10 p-6 text-sm text-destructive">
          You do not have permission to review reports.
        </div>
      ) : reports.length === 0 ? (
        <Card>
          <CardContent className="p-10 text-center text-sm text-muted-foreground">
            No submitted reports are waiting for review.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {reports.map((report) => (
            <Card key={report.id} >
              <CardContent className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <p className="font-semibold text-base">
                    {report.project_tag || "Weekly report"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {report.week_start} to {report.week_end}
                  </p>
                </div>
                <Button onClick={() => selectReport(report)} className="cursor-pointer">
                  Review report
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

function VersionList({ versions }: { versions: ReportVersion[] }) {
  if (!versions.length) return null;
  return (
    <section className="space-y-3 border-t pt-5">
      <h2 className="flex items-center gap-2 font-semibold">
        <FileClock className="h-4 w-4" /> Previous versions
      </h2>
      <div className="space-y-2">
        {versions.map((version, index) => (
          <details
            key={version.id ?? version.version_number ?? index}
            className="rounded-md border p-3"
          >
            <summary className="cursor-pointer text-sm font-medium">
              Version {version.version_number ?? index + 1} ·{" "}
              {version.status ?? "Unknown"} ·{" "}
              {formatDate(version.submitted_at ?? version.created_at)}
            </summary>
            <p className="mt-2 text-sm text-muted-foreground">
              {version.review_comment || "No review comment recorded."}
            </p>
          </details>
        ))}
      </div>
    </section>
  );
}
