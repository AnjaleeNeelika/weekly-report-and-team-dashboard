"use client";

import { Button } from "@/components/ui/button";
import { fetchReportsForCurrentUser } from "@/data/report/data";
import { useAuth } from "@/contexts/auth-context";
import { Report } from "@/types/report";
import { AlertCircle, Plus, Clock3 } from "lucide-react";
import { useEffect, useState } from "react";
import AddNewReportDialog from "../components/add-new-report-dialog";
import { useRouter } from "next/navigation";

export default function ReportHistory() {
  const { user } = useAuth();
  const [isAddClicked, setIsAddClicked] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [reports, setReports] = useState<Report[]>([]);

  const router = useRouter();

  const loadReports = async () => {
    if (!user?.id) return;

    setIsLoading(true);
    try {
      const data = await fetchReportsForCurrentUser(Number(user.id));
      setReports(data);
    } catch (error) {
      console.error("Failed to fetch reports:", error);
      setReports([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadReports();
  }, [user?.id]);

  return (
    <div className="flex-1 w-full p-6 space-y-6 text-foreground">
      <div className="flex flex-wrap gap-5 justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Weekly Reports History</h1>
          <p className="text-muted-foreground">
            Your past reports and their statuses
          </p>
        </div>
        <Button onClick={() => router.push("/personal-weekly-reports/new")}>
          <Plus className="h-4 w-4" />
          New Report
        </Button>
      </div>

      {isLoading ? (
        <div className="rounded-xl border border-border bg-card p-6 text-sm text-muted-foreground">
          Loading reports...
        </div>
      ) : reports.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border bg-card p-10 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-muted">
            <Clock3 className="h-5 w-5 text-muted-foreground" />
          </div>
          <h2 className="mt-4 text-lg font-semibold">No weekly reports yet</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Your personal weekly report history will appear here once you create a report.
          </p>
        </div>
      ) : (
        <div className="grid gap-4">
          {reports.map((report) => (
            <div key={report.id ?? `${report.week_start}-${report.project_tag}`} className="rounded-xl border border-border bg-card p-5 shadow-sm">
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div>
                  <div className="text-sm text-muted-foreground">Week of</div>
                  <div className="text-xl font-semibold">
                    {report.week_start || "—"} to {report.week_end || "—"}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="rounded-full border border-primary/30 bg-primary/10 px-2 py-1 text-xs font-medium text-primary">
                    {report.status || "Draft"}
                  </span>
                  <span className="rounded-full bg-muted px-2 py-1 text-xs text-muted-foreground">
                    {report.project_tag || "General"}
                  </span>
                </div>
              </div>

              <div className="mt-4 grid gap-3 md:grid-cols-3 text-sm">
                <div>
                  <div className="text-muted-foreground">Key Achievement</div>
                  <div>{report.key_achievement || "—"}</div>
                </div>
                <div>
                  <div className="text-muted-foreground">Key Blocker</div>
                  <div>{report.key_blocker || "—"}</div>
                </div>
                <div>
                  <div className="text-muted-foreground">Tasks Planned Next Week</div>
                  <div className="line-clamp-2">{report.tasks_planned_next_week || "—"}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {!user?.id && !isLoading && (
        <div className="flex items-center gap-2 rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-sm text-amber-700 dark:text-amber-300">
          <AlertCircle className="h-4 w-4" />
          Please sign in to view your weekly reports.
        </div>
      )}
    </div>
  );
}