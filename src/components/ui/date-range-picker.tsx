import { format, isValid, parseISO, subDays } from "date-fns";
import { CalendarRange } from "lucide-react";
import { useEffect, useMemo, useRef } from "react";
import { cn } from "@/lib/utils";

type JQueryStatic = (typeof import("jquery"))["default"];

export type DateRangeValue = {
  startDate: string;
  endDate: string;
};

type DateRangePickerProps = {
  value: DateRangeValue;
  onChange: (value: DateRangeValue) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  minDate?: string;
  maxDate?: string;
  opens?: "left" | "right" | "center";
  drops?: "down" | "up" | "auto";
};

type PickerInstance = {
  setStartDate: (value: string | Date) => void;
  setEndDate: (value: string | Date) => void;
  remove: () => void;
  startDate: { format: (pattern: string) => string };
  endDate: { format: (pattern: string) => string };
};

type PickerElement = {
  daterangepicker: (options: Record<string, unknown>) => void;
  data: (key: "daterangepicker") => PickerInstance | undefined;
  on: (events: string, handler: (...args: unknown[]) => void) => void;
  off: (events?: string) => void;
};

const DISPLAY_FORMAT = "MMM d, yyyy";
function parseDateValue(value: string) {
  if (!value) {
    return null;
  }

  const parsed = parseISO(value);
  return isValid(parsed) ? parsed : null;
}

function getFallbackRange(value: DateRangeValue) {
  const parsedStart = parseDateValue(value.startDate);
  const parsedEnd = parseDateValue(value.endDate);

  if (parsedStart && parsedEnd) {
    return { start: parsedStart, end: parsedEnd };
  }

  if (parsedStart) {
    return { start: parsedStart, end: parsedStart };
  }

  if (parsedEnd) {
    return { start: parsedEnd, end: parsedEnd };
  }

  const end = new Date();
  return { start: subDays(end, 29), end };
}

function buildDisplayValue(value: DateRangeValue, placeholder: string) {
  const parsedStart = parseDateValue(value.startDate);
  const parsedEnd = parseDateValue(value.endDate);

  if (parsedStart && parsedEnd) {
    return `${format(parsedStart, DISPLAY_FORMAT)} - ${format(parsedEnd, DISPLAY_FORMAT)}`;
  }

  if (parsedStart) {
    return `From ${format(parsedStart, DISPLAY_FORMAT)}`;
  }

  if (parsedEnd) {
    return `Until ${format(parsedEnd, DISPLAY_FORMAT)}`;
  }

  return placeholder;
}

export function DateRangePicker({
  value,
  onChange,
  placeholder = "Select date range",
  className,
  disabled = false,
  minDate,
  maxDate,
  opens = "right",
  drops = "auto",
}: DateRangePickerProps) {
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const pickerRef = useRef<PickerInstance | null>(null);
  const pickerElementRef = useRef<PickerElement | null>(null);
  const onChangeRef = useRef(onChange);
  const valueRef = useRef(value);

  const displayValue = useMemo(() => buildDisplayValue(value, placeholder), [placeholder, value]);
  const hasValue = Boolean(value.startDate || value.endDate);

  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  useEffect(() => {
    valueRef.current = value;
  }, [value]);

  useEffect(() => {
    if (disabled || typeof window === "undefined" || !triggerRef.current) {
      return;
    }

    let isCancelled = false;

    void (async () => {
      const jqueryModule = await import("jquery");
      const momentModule = await import("moment");
      const jquery = (jqueryModule.default ?? jqueryModule) as JQueryStatic;
      const moment = (momentModule.default ?? momentModule) as typeof import("moment");

      (
        window as Window & {
          $?: JQueryStatic;
          jQuery?: JQueryStatic;
          moment?: typeof import("moment");
        }
      ).$ = jquery;
      (
        window as Window & {
          $?: JQueryStatic;
          jQuery?: JQueryStatic;
          moment?: typeof import("moment");
        }
      ).jQuery = jquery;
      (
        window as Window & {
          $?: JQueryStatic;
          jQuery?: JQueryStatic;
          moment?: typeof import("moment");
        }
      ).moment = moment;

      await import("bootstrap-daterangepicker");

      if (isCancelled || !triggerRef.current) {
        return;
      }

      const pickerElement = jquery(triggerRef.current) as unknown as PickerElement;
      const fallbackRange = getFallbackRange(valueRef.current);

      pickerElement.daterangepicker({
        autoApply: true,
        autoUpdateInput: false,
        alwaysShowCalendars: true,
        buttonClasses: "daterangepicker-action",
        applyButtonClasses: "daterangepicker-apply",
        cancelButtonClasses: "daterangepicker-cancel",
        drops,
        endDate: moment(fallbackRange.end),
        linkedCalendars: false,
        locale: {
          cancelLabel: "Clear",
          format: "YYYY-MM-DD",
        },
        maxDate: maxDate ? moment(maxDate, "YYYY-MM-DD") : undefined,
        minDate: minDate ? moment(minDate, "YYYY-MM-DD") : undefined,
        opens,
        ranges: {
          Today: [moment(), moment()],
          Yesterday: [moment().subtract(1, "days"), moment().subtract(1, "days")],
          "Last 7 Days": [moment().subtract(6, "days"), moment()],
          "Last 30 Days": [moment().subtract(29, "days"), moment()],
          "This Month": [moment().startOf("month"), moment().endOf("month")],
          "Last Month": [
            moment().subtract(1, "month").startOf("month"),
            moment().subtract(1, "month").endOf("month"),
          ],
        },
        showCustomRangeLabel: true,
        startDate: moment(fallbackRange.start),
      });

      pickerElement.on("apply.daterangepicker", (_event, picker) => {
        const nextPicker = picker as PickerInstance;

        onChangeRef.current({
          startDate: nextPicker.startDate.format("YYYY-MM-DD"),
          endDate: nextPicker.endDate.format("YYYY-MM-DD"),
        });
      });

      pickerElement.on("cancel.daterangepicker", () => {
        const resetEnd = new Date();
        const resetStart = subDays(resetEnd, 29);

        pickerRef.current?.setStartDate(resetStart);
        pickerRef.current?.setEndDate(resetEnd);
        onChangeRef.current({ startDate: "", endDate: "" });
      });

      pickerRef.current = pickerElement.data("daterangepicker") ?? null;
      pickerElementRef.current = pickerElement;
    })();

    return () => {
      isCancelled = true;
      pickerElementRef.current?.off(".daterangepicker");
      pickerRef.current?.remove();
      pickerElementRef.current = null;
      pickerRef.current = null;
    };
  }, [disabled, drops, maxDate, minDate, opens]);

  useEffect(() => {
    const picker = pickerRef.current;

    if (!picker) {
      return;
    }

    const nextRange = getFallbackRange(value);
    picker.setStartDate(nextRange.start);
    picker.setEndDate(nextRange.end);
  }, [value]);

  return (
    <div className={className}>
      <div className="flex items-center gap-2">
        <button
          ref={triggerRef}
          type="button"
          disabled={disabled}
          className={cn(
            "flex h-[50px] w-full items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-left text-sm shadow-sm transition-colors",
            "hover:border-slate-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/40",
            "disabled:cursor-not-allowed disabled:opacity-60",
          )}
        >
          <span className="flex min-w-0 items-center gap-3">
            <CalendarRange className="h-4 w-4 shrink-0 text-slate-500" />
            <span className={cn("truncate", hasValue ? "text-slate-900" : "text-slate-500")}>
              {displayValue}
            </span>
          </span>
        </button>

        <button
          type="button"
          disabled={disabled || !hasValue}
          onClick={() => onChange({ startDate: "", endDate: "" })}
          className={cn(
            "inline-flex h-[50px] shrink-0 items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm font-medium text-slate-600 shadow-sm transition-colors",
            "hover:border-slate-300 hover:text-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/40",
            "disabled:cursor-not-allowed disabled:opacity-40",
          )}
          aria-label="Clear selected date range"
        >
          Clear
        </button>
      </div>
    </div>
  );
}
