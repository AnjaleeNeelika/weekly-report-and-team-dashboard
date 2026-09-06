"use client"

import * as React from "react"
import { cn } from "cn"
import { format } from "date-fns"
import { Calendar as CalendarIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

interface DatePickerProps {
  label?: string;
  disabled?: boolean;
  value?: string | Date | null;
  onChange?: (isoDate: string | null) => void;
}

export function DatePicker({ label, disabled, value, onChange }: DatePickerProps) {
  const [date, setDate] = React.useState<Date | undefined>(() => {
    if (!value) return undefined;
    if (typeof value === "string") {
      const parts = value.split("-").map((p) => Number(p));
      if (parts.length === 3) return new Date(parts[0], parts[1] - 1, parts[2]);
      return new Date(value);
    }
    return value as Date;
  });

  React.useEffect(() => {
    if (!value) {
      setDate(undefined);
      return;
    }
    if (typeof value === "string") {
      const parts = value.split("-").map((p) => Number(p));
      if (parts.length === 3) setDate(new Date(parts[0], parts[1] - 1, parts[2]));
      else setDate(new Date(value));
    } else setDate(value as Date);
  }, [value]);

  const handleSelect = (d: Date | undefined) => {
    setDate(d);
    if (!onChange) return;
    if (!d) return onChange(null);
    const iso = format(d, "yyyy-MM-dd");
    onChange(iso);
  };

  return (
    <Popover>
      <PopoverTrigger asChild disabled={disabled}>
        <Button
          variant="outline"
          data-empty={!date}
          className="w-[280px] justify-start text-left font-normal data-[empty=true]:text-muted-foreground"
        >
          <CalendarIcon />
          {date ? format(date, "PPP") : <span>{label || "Pick a date"}</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0">
        <Calendar mode="single" selected={date} onSelect={handleSelect} />
      </PopoverContent>
    </Popover>
  );
}