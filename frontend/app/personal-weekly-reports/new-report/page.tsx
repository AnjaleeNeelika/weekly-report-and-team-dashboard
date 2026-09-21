import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { DatePicker } from "@/components/ui/date-picker";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function NewReport() {
  return (
    <div className="flex-1 w-full p-6 space-y-6 text-foreground">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Add A New Report</h1>
        <p className="text-muted-foreground">Create new reports</p>
      </div>

      <Card className="max-w-5xl w-full mx-auto p-0 gap-0">
        <CardHeader className="bg-accent px-5 py-4 shadow-sm">
            <CardTitle className="font-semibold">New Weekly Report</CardTitle>
        </CardHeader>

        <div className="p-5">
            <div className="flex gap-5 flex-wrap">
                <div className="flex flex-col gap-1 flex-1">
                    <Label className="text-xs">Week Starting<span className="text-red-500">*</span></Label>
                    <DatePicker label="Pick the week start date" />
                </div>
                <div className="flex flex-col gap-1 flex-1">
                    <Label className="text-xs">Week Ending</Label>
                    <DatePicker label="Week end date" disabled />
                </div>
                <div className="flex flex-col gap-1 flex-1 min-w-[200px]">
                    <Label className="text-xs">Project / Category<span className="text-red-500">*</span></Label>
                    <Input placeholder="e.g. Project A" />
                </div>
            </div>
        </div>

        <CardFooter>

        </CardFooter>
      </Card>
    </div>
  );
}
