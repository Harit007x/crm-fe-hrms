import { useState } from "react";
import { format } from "date-fns";
import type { DateRange } from "react-day-picker";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Icons } from "@/components/icons";
import { cn } from "@/lib/utils";

interface DateRangeFilterProps {
  dateRange: DateRange | undefined;
  onDateRangeChange: (range: DateRange | undefined) => void;
  className?: string;
  align?: "start" | "center" | "end";
}

export function DateRangeFilter({
  dateRange,
  onDateRangeChange,
  className,
  align = "start",
}: DateRangeFilterProps) {
  const [open, setOpen] = useState(false);

  const handleClear = () => {
    onDateRangeChange(undefined);
  };

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            id="date-range-filter-trigger"
            variant="outline"
            className={cn(
              "h-9 justify-start text-left font-normal min-w-[240px]",
              !dateRange?.from && "text-muted-foreground"
            )}
          >
            <Icons.calender className="mr-2 h-4 w-4" />
            {dateRange?.from ? (
              dateRange.to ? (
                <>
                  {format(dateRange.from, "LLL dd, y")} -{" "}
                  {format(dateRange.to, "LLL dd, y")}
                </>
              ) : (
                format(dateRange.from, "LLL dd, y")
              )
            ) : (
              <span>Pick a date range</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align={align}>
          <Calendar
            mode="range"
            defaultMonth={dateRange?.from}
            selected={dateRange}
            onSelect={onDateRangeChange}
            numberOfMonths={2}
          />
        </PopoverContent>
      </Popover>
      {dateRange?.from && (
        <Button
          id="date-range-filter-clear"
          variant="ghost"
          size="icon-sm"
          onClick={handleClear}
          className="text-muted-foreground hover:text-foreground"
        >
          <Icons.x className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}
