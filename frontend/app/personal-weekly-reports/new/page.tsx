"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ChevronDown, Plus, Trash2 } from "lucide-react";

import { DatePicker } from "@/components/date-picker";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  ReportCreatePayload,
  ReportStatus,
  ReportTask,
  ReportTimeBreakdown,
  TaskPriority,
  TaskStatus,
  TaskType,
} from "@/types/report";
import { createReport } from "@/data/report/data";
import { cn } from "cn";
import { useAuth } from "@/contexts/auth-context";

function computeWeekEnd(weekStart: string) {
  if (!weekStart) return "";
  const start = new Date(weekStart);
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  return end.toISOString().split("T")[0];
}

const taskPriorities: TaskPriority[] = ["Critical", "High", "Medium", "Low"];
const taskStatuses: TaskStatus[] = [
  "Not Started",
  "In Progress",
  "Completed",
  "Blocked",
];

const emptyTask = (): ReportTask => ({
  task_name: "",
  priority: "Medium",
  planned_percentage: undefined,
  actual_percentage: undefined,
  status: "Not Started",
  time_planned_hours: undefined,
  time_spent_hours: undefined,
  deliverable_output: undefined,
});

interface FlaggedNote {
  text: string;
  is_key: boolean;
}

export default function NewReport() {
  const router = useRouter();
  const { user } = useAuth();

  const [weekStart, setWeekStart] = useState("");
  const [weekEnd, setWeekEnd] = useState("");
  const [project, setProject] = useState("");

  const [tasks, setTasks] = useState<ReportTask[]>(() => [emptyTask()]);

  const [nextWeekPlan, setNextWeekPlan] = useState("");
  const [blockers, setBlockers] = useState<FlaggedNote[]>([]);
  const [achievements, setAchievements] = useState<FlaggedNote[]>([]);
  const [hours, setHours] = useState({
    development: "",
    testing: "",
    meetings: "",
    documentation: "",
  });
  const [notes, setNotes] = useState("");

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [hoursOpen, setHoursOpen] = useState(false);

  // Field-wise Error States
  const [fieldErrors, setFieldErrors] = useState<{
    weekStart?: string;
    project?: string;
    tasks?: string;
  }>({});

  const [taskErrors, setTaskErrors] = useState<
    Record<
      number,
      {
        task_name?: string;
        planned_percentage?: string;
        actual_percentage?: string;
        time_planned_hours?: string;
        time_spent_hours?: string;
      }
    >
  >({});

  const [hoursErrors, setHoursErrors] = useState<
    Partial<
      Record<"development" | "testing" | "meetings" | "documentation", string>
    >
  >({});

  // Automatically clear task container error when user enters a valid task name
  useEffect(() => {
    if (
      fieldErrors.tasks &&
      tasks.some((t) => t.task_name && t.task_name.trim())
    ) {
      setFieldErrors((prev) => ({ ...prev, tasks: undefined }));
    }
  }, [tasks, fieldErrors.tasks]);

  const addTask = () => setTasks((prev) => [...prev, emptyTask()]);
  const removeTask = (index: number) => {
    setTasks((prev) => prev.filter((_, i) => i !== index));
    setTaskErrors((prev) => {
      const next = { ...prev };
      delete next[index];
      return next;
    });
  };

  const addBlocker = () =>
    setBlockers((prev) => [...prev, { text: "", is_key: false }]);
  const removeBlocker = (index: number) =>
    setBlockers((prev) => prev.filter((_, i) => i !== index));

  const setKeyBlocker = (index: number) => {
    setBlockers((prev) =>
      prev.map((item, i) => ({
        ...item,
        is_key: i === index ? !item.is_key : false,
      })),
    );
  };

  const addAchievement = () =>
    setAchievements((prev) => [...prev, { text: "", is_key: false }]);
  const removeAchievement = (index: number) =>
    setAchievements((prev) => prev.filter((_, i) => i !== index));

  const setKeyAchievement = (index: number) => {
    setAchievements((prev) =>
      prev.map((item, i) => ({
        ...item,
        is_key: i === index ? !item.is_key : false,
      })),
    );
  };

  const validateForm = (): boolean => {
    let hasError = false;
    const newFieldErrors: typeof fieldErrors = {};
    const newTaskErrors: typeof taskErrors = {};
    const newHoursErrors: typeof hoursErrors = {};

    // 1. Validate General Fields
    if (!weekStart) {
      newFieldErrors.weekStart = "Week start date is required.";
      hasError = true;
    }

    if (!project || !project.trim()) {
      newFieldErrors.project = "Project or category tag is required.";
      hasError = true;
    }

    if (
      tasks.length === 0 ||
      !tasks.some((t) => t.task_name && t.task_name.trim())
    ) {
      newFieldErrors.tasks = "Add at least one valid task before submitting.";
      hasError = true;
    }

    // 2. Validate Individual Tasks
    tasks.forEach((t, idx) => {
      const currentTaskErr: {
        task_name?: string;
        planned_percentage?: string;
        actual_percentage?: string;
        time_planned_hours?: string;
        time_spent_hours?: string;
      } = {};

      if (!t.task_name || !t.task_name.trim()) {
        currentTaskErr.task_name = "Task name is required.";
        hasError = true;
      }

      if (
        t.planned_percentage !== undefined &&
        (Number.isNaN(t.planned_percentage) ||
          t.planned_percentage < 0 ||
          t.planned_percentage > 100)
      ) {
        currentTaskErr.planned_percentage = "Must be between 0 and 100.";
        hasError = true;
      }

      if (
        t.actual_percentage !== undefined &&
        (Number.isNaN(t.actual_percentage) ||
          t.actual_percentage < 0 ||
          t.actual_percentage > 100)
      ) {
        currentTaskErr.actual_percentage = "Must be between 0 and 100.";
        hasError = true;
      }

      if (
        t.time_planned_hours !== undefined &&
        (Number.isNaN(t.time_planned_hours) || t.time_planned_hours < 0)
      ) {
        currentTaskErr.time_planned_hours = "Must be 0 or higher.";
        hasError = true;
      }

      if (
        t.time_spent_hours !== undefined &&
        (Number.isNaN(t.time_spent_hours) || t.time_spent_hours < 0)
      ) {
        currentTaskErr.time_spent_hours = "Must be 0 or higher.";
        hasError = true;
      }

      if (Object.keys(currentTaskErr).length > 0) {
        newTaskErrors[idx] = currentTaskErr;
      }
    });

    // 3. Validate Hours Breakdown
    (["development", "testing", "meetings", "documentation"] as const).forEach(
      (key) => {
        const val = hours[key];
        if (val !== "" && (Number.isNaN(Number(val)) || Number(val) < 0)) {
          newHoursErrors[key] = "Enter a valid non-negative number.";
          hasError = true;
        }
      },
    );

    setFieldErrors(newFieldErrors);
    setTaskErrors(newTaskErrors);
    setHoursErrors(newHoursErrors);

    if (Object.keys(newHoursErrors).length > 0) {
      setHoursOpen(true);
    }

    return !hasError;
  };

  const handleSave = async (
    status: Extract<ReportStatus, "Draft" | "Submitted">,
  ) => {
    setError("");

    // Frontend validation before submission
    if (status === "Submitted") {
      const isValid = validateForm();
      if (!isValid) {
        setError(
          "Please resolve the highlighted field errors before submitting.",
        );
        toast.error(
          "Form contains errors. Please check the highlighted fields.",
        );
        return;
      }
    }

    if (status === "Draft") {
      const isValid = validateForm();

      if (!isValid) return;
    }

    const timeBreakdowns: ReportTimeBreakdown[] = (
      [
        ["Development", hours.development],
        ["Testing", hours.testing],
        ["Meetings", hours.meetings],
        ["Documentation", hours.documentation],
      ] as [TaskType, string][]
    )
      .map(([task_type, value]) => ({
        task_type,
        hours_spent: value === "" ? 0 : Number(value),
      }))
      .filter(({ hours_spent }) => hours_spent !== 0);

    const payload: ReportCreatePayload = {
      user_id: user?.id,
      week_start: weekStart,
      week_end: weekEnd,
      project_tag: project,
      tasks,
      tasks_planned_next_week: nextWeekPlan,
      blockers: blockers.map((b) => b.text).filter(Boolean),
      key_blocker: blockers.find((b) => b.is_key)?.text,
      achievements: achievements.map((a) => a.text).filter(Boolean),
      key_achievement: achievements.find((a) => a.is_key)?.text,
      time_breakdowns: timeBreakdowns,
      notes_or_links: notes,
      status,
    };

    setSaving(true);
    try {
      const response = await createReport(payload);
      if (response.success) {
        toast.success(
          status === "Draft"
            ? "Report saved as draft."
            : "Report submitted for review.",
        );
        router.push("/personal-weekly-reports/history");
        return;
      }

      const msg =
        response.error ?? response.message ?? "Failed to save report.";
      setError(msg);
      toast.error(msg);
    } catch (err) {
      console.error("Failed to save report", err);
      const message =
        err instanceof Error
          ? err.message
          : "Failed to save report. Please try again.";
      setError(message);
      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex-1 w-full p-6 space-y-6 text-foreground">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Add A New Report</h1>
        <p className="text-muted-foreground">Create new reports</p>
      </div>

      <Card className="w-full !max-w-[900px] p-0 mx-auto gap-0">
        <CardHeader className="bg-accent p-5">
          <CardTitle className="text-lg">New Weekly Report</CardTitle>
        </CardHeader>

        <div className="p-5 flex flex-col gap-5">
          {error && (
            <div className="p-3 text-sm font-medium text-red-600 bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900 rounded-md">
              {error}
            </div>
          )}

          {/* Date & Project Row */}
          <div className="flex gap-5 items-start flex-wrap">
            <div className="flex flex-col gap-1 flex-1 w-full">
              <Label>
                Week Starting <span className="text-red-500">*</span>
              </Label>
              <DatePicker
                label="Pick the week start date"
                value={weekStart || null}
                onChange={(iso) => {
                  setWeekStart(iso ?? "");
                  setWeekEnd(computeWeekEnd(iso ?? ""));
                  if (fieldErrors.weekStart) {
                    setFieldErrors((f) => ({ ...f, weekStart: undefined }));
                  }
                }}
              />
              {fieldErrors.weekStart && (
                <p className="text-xs text-red-600 font-medium">
                  {fieldErrors.weekStart}
                </p>
              )}
            </div>

            <div className="flex flex-col gap-1 flex-1 w-full">
              <Label>Week Ending</Label>
              <DatePicker
                label="Week ending date"
                value={weekEnd || null}
                disabled={true}
              />
            </div>

            <div className="flex flex-col gap-1 flex-1 w-full">
              <Label>
                Project/Category <span className="text-red-500">*</span>
              </Label>
              <Input
                value={project}
                onChange={(e) => {
                  setProject(e.target.value);
                  if (fieldErrors.project && e.target.value.trim()) {
                    setFieldErrors((f) => ({ ...f, project: undefined }));
                  }
                }}
                placeholder="e.g. Client A"
                className={cn(
                  "w-full",
                  fieldErrors.project
                    ? "border-red-500 focus-visible:ring-red-500"
                    : "",
                )}
              />
              {fieldErrors.project && (
                <p className="text-xs text-red-600 font-medium">
                  {fieldErrors.project}
                </p>
              )}
            </div>
          </div>

          {/* Tasks Completed Table */}
          <div className="flex flex-col gap-2">
            <div className="flex gap-5 justify-between items-center mb-1">
              <h2 className="text-base font-semibold">
                Tasks Completed <span className="text-red-500">*</span>
              </h2>
              <Button
                type="button"
                variant="outline"
                className="flex gap-1 items-center justify-center"
                onClick={addTask}
              >
                <Plus className="w-4 h-4" />
                Add Task
              </Button>
            </div>

            <div
              className={cn(
                "border rounded-md overflow-x-auto",
                fieldErrors.tasks ? "border-red-500 ring-1 ring-red-500" : "",
              )}
            >
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>
                      Task <span className="text-red-500">*</span>
                    </TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Planned %</TableHead>
                    <TableHead>Actual %</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Hrs. Planned</TableHead>
                    <TableHead>Hrs. Spent</TableHead>
                    <TableHead>Output</TableHead>
                    <TableHead className="w-10" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tasks.map((t, i) => (
                    <TableRow key={i}>
                      <TableCell className="align-top">
                        <Input
                          value={t.task_name ?? ""}
                          onChange={(e) => {
                            const val = e.target.value;
                            setTasks((prev) =>
                              prev.map((p, idx) =>
                                idx === i ? { ...p, task_name: val } : p,
                              ),
                            );
                            if (taskErrors[i]?.task_name && val.trim()) {
                              setTaskErrors((prev) => ({
                                ...prev,
                                [i]: { ...prev[i], task_name: undefined },
                              }));
                            }
                          }}
                          placeholder="e.g. Build login page"
                          className={cn(
                            "w-52 max-w-full",
                            taskErrors[i]?.task_name
                              ? "border-red-500 focus-visible:ring-red-500"
                              : "",
                          )}
                        />
                        {taskErrors[i]?.task_name && (
                          <p className="text-xs text-red-600 mt-1 font-medium">
                            {taskErrors[i].task_name}
                          </p>
                        )}
                      </TableCell>

                      <TableCell className="align-top">
                        <Select
                          value={t.priority ?? "Medium"}
                          onValueChange={(val) =>
                            setTasks((prev) =>
                              prev.map((p, idx) =>
                                idx === i
                                  ? { ...p, priority: val as TaskPriority }
                                  : p,
                              ),
                            )
                          }
                        >
                          <SelectTrigger className="w-32">
                            <SelectValue placeholder="Medium">
                              {t.priority ?? "Medium"}
                            </SelectValue>
                          </SelectTrigger>
                          <SelectContent position="popper">
                            <SelectGroup>
                              {taskPriorities.map((priority) => (
                                <SelectItem key={priority} value={priority}>
                                  {priority}
                                </SelectItem>
                              ))}
                            </SelectGroup>
                          </SelectContent>
                        </Select>
                      </TableCell>

                      <TableCell className="align-top">
                        <Input
                          type="number"
                          value={t.planned_percentage ?? ""}
                          onChange={(e) => {
                            const val =
                              e.target.value === ""
                                ? undefined
                                : Number(e.target.value);
                            setTasks((prev) =>
                              prev.map((p, idx) =>
                                idx === i
                                  ? { ...p, planned_percentage: val }
                                  : p,
                              ),
                            );
                            if (taskErrors[i]?.planned_percentage) {
                              setTaskErrors((prev) => ({
                                ...prev,
                                [i]: {
                                  ...prev[i],
                                  planned_percentage: undefined,
                                },
                              }));
                            }
                          }}
                          className={cn(
                            "w-20",
                            taskErrors[i]?.planned_percentage
                              ? "border-red-500 focus-visible:ring-red-500"
                              : "",
                          )}
                        />
                        {taskErrors[i]?.planned_percentage && (
                          <p className="text-xs text-red-600 mt-1 font-medium">
                            {taskErrors[i].planned_percentage}
                          </p>
                        )}
                      </TableCell>

                      <TableCell className="align-top">
                        <Input
                          type="number"
                          value={t.actual_percentage ?? ""}
                          onChange={(e) => {
                            const val =
                              e.target.value === ""
                                ? undefined
                                : Number(e.target.value);
                            setTasks((prev) =>
                              prev.map((p, idx) =>
                                idx === i
                                  ? { ...p, actual_percentage: val }
                                  : p,
                              ),
                            );
                            if (taskErrors[i]?.actual_percentage) {
                              setTaskErrors((prev) => ({
                                ...prev,
                                [i]: {
                                  ...prev[i],
                                  actual_percentage: undefined,
                                },
                              }));
                            }
                          }}
                          className={cn(
                            "w-20",
                            taskErrors[i]?.actual_percentage
                              ? "border-red-500 focus-visible:ring-red-500"
                              : "",
                          )}
                        />
                        {taskErrors[i]?.actual_percentage && (
                          <p className="text-xs text-red-600 mt-1 font-medium">
                            {taskErrors[i].actual_percentage}
                          </p>
                        )}
                      </TableCell>

                      <TableCell className="align-top">
                        <Select
                          value={t.status ?? "Not Started"}
                          onValueChange={(val) =>
                            setTasks((prev) =>
                              prev.map((p, idx) =>
                                idx === i
                                  ? { ...p, status: val as TaskStatus }
                                  : p,
                              ),
                            )
                          }
                        >
                          <SelectTrigger className="w-32">
                            <SelectValue placeholder="Not Started">
                              {t.status ?? "Not Started"}
                            </SelectValue>
                          </SelectTrigger>
                          <SelectContent position="popper">
                            <SelectGroup>
                              {taskStatuses.map((status) => (
                                <SelectItem key={status} value={status}>
                                  {status}
                                </SelectItem>
                              ))}
                            </SelectGroup>
                          </SelectContent>
                        </Select>
                      </TableCell>

                      <TableCell className="align-top">
                        <Input
                          type="number"
                          value={t.time_planned_hours ?? ""}
                          onChange={(e) => {
                            const val =
                              e.target.value === ""
                                ? undefined
                                : Number(e.target.value);
                            setTasks((prev) =>
                              prev.map((p, idx) =>
                                idx === i
                                  ? { ...p, time_planned_hours: val }
                                  : p,
                              ),
                            );
                            if (taskErrors[i]?.time_planned_hours) {
                              setTaskErrors((prev) => ({
                                ...prev,
                                [i]: {
                                  ...prev[i],
                                  time_planned_hours: undefined,
                                },
                              }));
                            }
                          }}
                          className={cn(
                            "w-20",
                            taskErrors[i]?.time_planned_hours
                              ? "border-red-500 focus-visible:ring-red-500"
                              : "",
                          )}
                        />
                        {taskErrors[i]?.time_planned_hours && (
                          <p className="text-xs text-red-600 mt-1 font-medium">
                            {taskErrors[i].time_planned_hours}
                          </p>
                        )}
                      </TableCell>

                      <TableCell className="align-top">
                        <Input
                          type="number"
                          value={t.time_spent_hours ?? ""}
                          onChange={(e) => {
                            const val =
                              e.target.value === ""
                                ? undefined
                                : Number(e.target.value);
                            setTasks((prev) =>
                              prev.map((p, idx) =>
                                idx === i ? { ...p, time_spent_hours: val } : p,
                              ),
                            );
                            if (taskErrors[i]?.time_spent_hours) {
                              setTaskErrors((prev) => ({
                                ...prev,
                                [i]: {
                                  ...prev[i],
                                  time_spent_hours: undefined,
                                },
                              }));
                            }
                          }}
                          className={cn(
                            "w-20",
                            taskErrors[i]?.time_spent_hours
                              ? "border-red-500 focus-visible:ring-red-500"
                              : "",
                          )}
                        />
                        {taskErrors[i]?.time_spent_hours && (
                          <p className="text-xs text-red-600 mt-1 font-medium">
                            {taskErrors[i].time_spent_hours}
                          </p>
                        )}
                      </TableCell>

                      <TableCell className="align-top">
                        <Input
                          value={t.deliverable_output ?? ""}
                          onChange={(e) =>
                            setTasks((prev) =>
                              prev.map((p, idx) =>
                                idx === i
                                  ? { ...p, deliverable_output: e.target.value }
                                  : p,
                              ),
                            )
                          }
                          placeholder="e.g. PR #142"
                          className="w-48"
                        />
                      </TableCell>

                      <TableCell className="align-top">
                        {tasks.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeTask(i)}
                            className="text-sm text-muted-foreground hover:text-red-600 p-2"
                            aria-label="Remove task"
                          >
                            ✕
                          </button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            {fieldErrors.tasks && (
              <p className="text-xs text-red-600 font-medium">
                {fieldErrors.tasks}
              </p>
            )}
          </div>

          {/* Next Week Plan */}
          <div className="space-y-3">
            <Label>Tasks Planned for Next Week</Label>
            <Textarea
              value={nextWeekPlan}
              onChange={(e) => setNextWeekPlan(e.target.value)}
              placeholder="What are you planning to work on next week?"
            />
          </div>

          {/* Blockers Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold">Blockers / Challenges</h2>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addBlocker}
              >
                Add blocker
              </Button>
            </div>
            {blockers.length === 0 ? (
              <p className="rounded-md border border-dashed py-4 text-center text-sm text-slate-500">
                No blockers reported. Nice week!
              </p>
            ) : (
              <div className="space-y-2">
                {blockers.map((b, idx) => (
                  <div key={idx} className="flex items-center gap-3">
                    <Input
                      value={b.text}
                      onChange={(e) =>
                        setBlockers((prev) =>
                          prev.map((p, i) =>
                            i === idx ? { ...p, text: e.target.value } : p,
                          ),
                        )
                      }
                      placeholder="Describe the blocker..."
                      className="flex-1"
                    />
                    <div className="flex items-center gap-2">
                      <label className="flex items-center gap-1.5 text-xs text-muted-foreground cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={b.is_key}
                          onChange={() => setKeyBlocker(idx)}
                          className="rounded border-gray-300 text-primary focus:ring-primary"
                        />
                        Key Blocker
                      </label>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-red-600"
                        onClick={() => removeBlocker(idx)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Achievements Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold">Key Achievements</h2>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addAchievement}
              >
                Add achievement
              </Button>
            </div>
            {achievements.length === 0 ? (
              <p className="rounded-md border border-dashed py-4 text-center text-sm text-slate-500">
                No achievements added yet.
              </p>
            ) : (
              <div className="space-y-2">
                {achievements.map((a, idx) => (
                  <div key={idx} className="flex items-center gap-3">
                    <Input
                      value={a.text}
                      onChange={(e) =>
                        setAchievements((prev) =>
                          prev.map((p, i) =>
                            i === idx ? { ...p, text: e.target.value } : p,
                          ),
                        )
                      }
                      placeholder="Describe key achievement..."
                      className="flex-1"
                    />
                    <div className="flex items-center gap-2">
                      <label className="flex items-center gap-1.5 text-xs text-muted-foreground cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={a.is_key}
                          onChange={() => setKeyAchievement(idx)}
                          className="rounded border-gray-300 text-primary focus:ring-primary"
                        />
                        Key Achievement
                      </label>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-red-600"
                        onClick={() => removeAchievement(idx)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Hours Breakdown Collapsible Section */}
          <Collapsible open={hoursOpen} onOpenChange={setHoursOpen}>
            <CollapsibleTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                className="flex items-center justify-between w-full p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md"
              >
                <span className="text-sm font-semibold">Hours Breakdown</span>
                <ChevronDown
                  className={cn(
                    "h-4 w-4 transition-transform duration-200",
                    hoursOpen && "rotate-180",
                  )}
                />
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="pt-3 space-y-3">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="space-y-1">
                  <Label className="text-xs">Development</Label>
                  <Input
                    type="number"
                    value={hours.development}
                    onChange={(e) => {
                      const val = e.target.value;
                      setHours((prev) => ({ ...prev, development: val }));
                      if (hoursErrors.development) {
                        setHoursErrors((prev) => ({
                          ...prev,
                          development: undefined,
                        }));
                      }
                    }}
                    placeholder="0"
                    className={
                      hoursErrors.development
                        ? "border-red-500 focus-visible:ring-red-500"
                        : ""
                    }
                  />
                  {hoursErrors.development && (
                    <p className="text-xs text-red-600 font-medium">
                      {hoursErrors.development}
                    </p>
                  )}
                </div>

                <div className="space-y-1">
                  <Label className="text-xs">Testing</Label>
                  <Input
                    type="number"
                    value={hours.testing}
                    onChange={(e) => {
                      const val = e.target.value;
                      setHours((prev) => ({ ...prev, testing: val }));
                      if (hoursErrors.testing) {
                        setHoursErrors((prev) => ({
                          ...prev,
                          testing: undefined,
                        }));
                      }
                    }}
                    placeholder="0"
                    className={
                      hoursErrors.testing
                        ? "border-red-500 focus-visible:ring-red-500"
                        : ""
                    }
                  />
                  {hoursErrors.testing && (
                    <p className="text-xs text-red-600 font-medium">
                      {hoursErrors.testing}
                    </p>
                  )}
                </div>

                <div className="space-y-1">
                  <Label className="text-xs">Meetings</Label>
                  <Input
                    type="number"
                    value={hours.meetings}
                    onChange={(e) => {
                      const val = e.target.value;
                      setHours((prev) => ({ ...prev, meetings: val }));
                      if (hoursErrors.meetings) {
                        setHoursErrors((prev) => ({
                          ...prev,
                          meetings: undefined,
                        }));
                      }
                    }}
                    placeholder="0"
                    className={
                      hoursErrors.meetings
                        ? "border-red-500 focus-visible:ring-red-500"
                        : ""
                    }
                  />
                  {hoursErrors.meetings && (
                    <p className="text-xs text-red-600 font-medium">
                      {hoursErrors.meetings}
                    </p>
                  )}
                </div>

                <div className="space-y-1">
                  <Label className="text-xs">Documentation</Label>
                  <Input
                    type="number"
                    value={hours.documentation}
                    onChange={(e) => {
                      const val = e.target.value;
                      setHours((prev) => ({ ...prev, documentation: val }));
                      if (hoursErrors.documentation) {
                        setHoursErrors((prev) => ({
                          ...prev,
                          documentation: undefined,
                        }));
                      }
                    }}
                    placeholder="0"
                    className={
                      hoursErrors.documentation
                        ? "border-red-500 focus-visible:ring-red-500"
                        : ""
                    }
                  />
                  {hoursErrors.documentation && (
                    <p className="text-xs text-red-600 font-medium">
                      {hoursErrors.documentation}
                    </p>
                  )}
                </div>
              </div>
            </CollapsibleContent>
          </Collapsible>

          {/* Notes and Links */}
          <div className="space-y-3">
            <Label>Notes or Links</Label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Additional comments, PR links, or documents..."
            />
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              disabled={saving}
              onClick={() => handleSave("Draft")}
            >
              Save as Draft
            </Button>
            <Button
              type="button"
              disabled={saving}
              onClick={() => handleSave("Submitted")}
            >
              {saving ? "Saving..." : "Submit Report"}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
