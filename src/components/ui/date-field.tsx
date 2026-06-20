"use client";

import { useState } from "react";
import { format, parse } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

const DATE_FORMAT = "yyyy-MM-dd";

function parseDate(value: string) {
  return value ? parse(value, DATE_FORMAT, new Date()) : undefined;
}

export function DateField({
  label,
  value,
  onChange,
  onBlur,
  className,
}: {
  label: string;
  value: string;
  onChange: (value: string | undefined) => void;
  onBlur?: () => void;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const selected = parseDate(value);

  return (
    <Popover
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) onBlur?.();
      }}
    >
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          aria-label={label}
          className={cn("w-37.5 justify-start font-normal", className)}
        >
          <CalendarIcon className="size-4" />
          {selected ? (
            format(selected, "MMM d, yyyy")
          ) : (
            <span className="text-muted-foreground">{label}</span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          captionLayout="dropdown"
          selected={selected}
          onSelect={(date) => {
            onChange(date ? format(date, DATE_FORMAT) : undefined);
            setOpen(false);
          }}
        />
      </PopoverContent>
    </Popover>
  );
}
