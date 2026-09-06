"use client";

import { Button } from "@/components/ui/button";
import { fetchReportsForCurrentUser } from "@/data/report/data";
import { useAuth } from "@/contexts/auth-context";
import { Report, ReportStatus } from "@/types/report";
import { AlertCircle, Plus, Clock3, Search, FilePen, CheckCircle, FileCheck, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const reportStatus = [
  "All",
  "Draft",
  "Submitted",
  "Needs Correction",
  "Approved",
];

export default function ReportHistory() {
  const { user } = useAuth();
  const [isAddClicked, setIsAddClicked] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [reports, setReports] = useState<Report[]>([]);
  const [selectedStatus, setSelectedStatus] = useState<
    ReportStatus | "All" | null
  >(null);
  const [searchTerm, setSearchTerm] = useState("");

  const router = useRouter();

  const filteredReports = reports.filter((report) => {
    const matchesStatus =
      !selectedStatus ||
      selectedStatus === "All" ||
      report.status?.toLowerCase() === selectedStatus.toLowerCase();

    // 2. Search Filter (searches across project_tag, week_start, and week_end)
    const query = searchTerm.toLowerCase().trim();
    const matchesSearch =
      !query ||
      report.project_tag?.toLowerCase().includes(query) ||
      report.week_start?.toLowerCase().includes(query) ||
      report.week_end?.toLowerCase().includes(query);

    return matchesStatus && matchesSearch;
  });

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
          <h1 className="text-3xl font-bold tracking-tight">
            Weekly Reports History
          </h1>
          <p className="text-muted-foreground">
            Your past reports and their statuses
          </p>
        </div>
        <Button onClick={() => router.push("/personal-weekly-reports/new")}>
          <Plus className="h-4 w-4" />
          New Report
        </Button>
      </div>

      <Card className="p-5">
        <div className="flex items-center justify-between gap-5 flex-wrap">
          <div className="flex gap-2 items-center flex-1">
            <Search className="w-4 h-4 text-foreground" />
            <Input
              className="max-w-[300px] w-full"
              placeholder="Search report by the project or week..."
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
            />
          </div>

          <Select
            value={selectedStatus || "All"}
            onValueChange={(val) =>
              setSelectedStatus(val as ReportStatus | "All")
            }
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent position="popper">
              <SelectGroup>
                {reportStatus.map((status) => (
                  <SelectItem key={status} value={status}>
                    {status}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
      </Card>

      {isLoading ? (
        <div className="rounded-xl border border-border bg-card p-6 text-sm text-muted-foreground flex items-center justify-center gap-2">
          <Loader2 className="animate-spin" />
          <p>Loading reports...</p>
        </div>
      ) : reports.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border bg-card p-10 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-muted">
            <Clock3 className="h-5 w-5 text-muted-foreground" />
          </div>
          <h2 className="mt-4 text-lg font-semibold">No weekly reports yet</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Your personal weekly report history will appear here once you create
            a report.
          </p>
        </div>
      ) : filteredReports.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border bg-card p-10 text-center">
          <h2 className="text-lg font-semibold">No matching reports found</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Try adjusting your search criteria or status filter.
          </p>
          <Button
            variant="outline"
            className="mt-4"
            onClick={() => {
              setSearchTerm("");
              setSelectedStatus("All");
            }}
          >
            Reset Filters
          </Button>
        </div>
      ) : (
        <div className="grid gap-4">
          {filteredReports.map((report) => (
            <div
              key={report.id ?? `${report.week_start}-${report.project_tag}`}
              className="rounded-xl border border-border bg-card p-5 shadow-sm"
            >
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div>
                  <div className="text-sm text-muted-foreground">Project</div>
                  <div className="text-xl font-semibold">
                    {report.project_tag || "General"}
                  </div>
                </div>

                <div>
                  <div className="text-sm text-muted-foreground">Week of</div>
                  <div className="text-xl font-semibold">
                    {report.week_start || "—"} to {report.week_end || "—"}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  
                    {report.status === "Draft" ? (
                        <span className="rounded-full border border-primary/10 bg-primary/5 px-2.5 py-1 text-xs text-center font-medium text-primary/80 flex items-center justify-center gap-1">
                            <FilePen className="w-4 h-4" />
                            <p>Draft</p>
                        </span>                       
                    ): report.status === "Approved" ? (
                        <span className="rounded-full border border-green-100 bg-green-50 px-2.5 py-1 text-xs text-center font-medium text-green-500 flex items-center justify-center gap-1">
                            <CheckCircle className="w-4 h-4" />
                            <p>Approved</p>
                        </span>
                    ): report.status === "Needs Correction" ? (
                        <span className="rounded-full border border-orange-100 bg-orange-50 px-2.5 py-1 text-xs text-center font-medium text-orange-500 flex items-center justify-center gap-1">
                            <AlertCircle className="w-4 h-4" />
                            <p>Needs Correction</p>
                        </span>
                    ) : report.status === "Submitted" && 
                        <span className="rounded-full border border-blue-100 bg-blue-50 px-2.5 py-1 text-xs text-center font-medium text-blue-500 flex items-center justify-center gap-1">
                            <FileCheck className="w-4 h-4" />
                            <p>Submitted</p>
                        </span>
                    }
                </div>
              </div>

              <div className="mt-4 grid gap-5 lg:grid-cols-3 md:grid-cols-2 text-sm">
                <div>
                  <div className="text-muted-foreground font-medium">
                    Key Achievement
                  </div>
                  <div>{report.key_achievement || "—"}</div>
                </div>
                <div>
                  <div className="text-muted-foreground font-medium">
                    Key Blocker
                  </div>
                  <div>{report.key_blocker || "—"}</div>
                </div>
                <div>
                  <div className="text-muted-foreground font-medium">
                    Tasks Planned Next Week
                  </div>
                  <div className="line-clamp-2">
                    {report.tasks_planned_next_week || "—"}
                  </div>
                </div>
              </div>

              {(report.status === "Draft" || report.status === "Needs Correction") && report.id && (
                <Button
                  className="mt-5 cursor-pointer"
                  onClick={() => router.push(`/personal-weekly-reports/edit?id=${report.id}`)}
                >
                  Edit Report
                </Button>
              )}
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
