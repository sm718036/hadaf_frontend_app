"use client";

import * as React from "react";
import * as DropdownMenuPrimitive from "@radix-ui/react-dropdown-menu";
import { Check, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

type SelectMenuOption = {
  value: string;
  label: string;
  disabled?: boolean;
};

export function SelectMenu({
  value,
  onValueChange,
  options,
  placeholder = "Select an option",
  disabled = false,
  className,
  contentClassName,
}: {
  value: string;
  onValueChange: (value: string) => void;
  options: SelectMenuOption[];
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  contentClassName?: string;
}) {
  const selectedOption = options.find((option) => option.value === value);

  return (
    <DropdownMenuPrimitive.Root>
      <DropdownMenuPrimitive.Trigger asChild disabled={disabled}>
        <button
          type="button"
          className={cn(
            "flex h-12 w-full items-center justify-between rounded-2xl border border-slate-200 bg-white px-4 text-left text-sm text-slate-900 outline-none transition focus:border-slate-300 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400",
            className,
          )}
        >
          <span className={cn(!selectedOption && "text-slate-400")}>
            {selectedOption?.label || placeholder}
          </span>
          <ChevronDown className="h-4 w-4 text-slate-400" />
        </button>
      </DropdownMenuPrimitive.Trigger>
      <DropdownMenuPrimitive.Portal>
        <DropdownMenuPrimitive.Content
          sideOffset={8}
          align="start"
          className={cn(
            "z-50 max-h-80 w-[var(--radix-dropdown-menu-trigger-width)] overflow-y-auto rounded-2xl border border-slate-200 bg-white p-2 shadow-xl",
            "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
            contentClassName,
          )}
        >
          <DropdownMenuPrimitive.RadioGroup value={value} onValueChange={onValueChange}>
            {options.map((option) => (
              <DropdownMenuPrimitive.RadioItem
                key={option.value}
                value={option.value}
                disabled={option.disabled}
                className={cn(
                  "relative flex cursor-default select-none items-center rounded-xl px-10 py-3 text-sm text-slate-700 outline-none transition",
                  "focus:bg-slate-100 data-[state=checked]:bg-gold/10 data-[state=checked]:font-semibold data-[state=checked]:text-slate-900",
                  "data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
                )}
              >
                <DropdownMenuPrimitive.ItemIndicator className="absolute left-3 inline-flex items-center justify-center text-gold">
                  <Check className="h-4 w-4" />
                </DropdownMenuPrimitive.ItemIndicator>
                {option.label}
              </DropdownMenuPrimitive.RadioItem>
            ))}
          </DropdownMenuPrimitive.RadioGroup>
        </DropdownMenuPrimitive.Content>
      </DropdownMenuPrimitive.Portal>
    </DropdownMenuPrimitive.Root>
  );
}
