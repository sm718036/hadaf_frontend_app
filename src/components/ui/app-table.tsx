import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type TableAlign = "left" | "center" | "right";

function getAlignClass(align: TableAlign) {
  if (align === "left") return "text-left";
  if (align === "right") return "text-right";
  return "text-center";
}

export function AppTable({
  children,
  minWidthClass = "min-w-[720px]",
  className,
}: {
  children: ReactNode;
  minWidthClass?: string;
  className?: string;
}) {
  return (
    <div className="overflow-hidden rounded-[24px] border border-slate-200 bg-white">
      <div className="overflow-x-auto">
        <table className={cn("w-full text-sm", minWidthClass, className)}>{children}</table>
      </div>
    </div>
  );
}

export function AppTableHead({ children }: { children: ReactNode }) {
  return <thead className="bg-slate-900 text-slate-100">{children}</thead>;
}

export function AppTableBody({ children }: { children: ReactNode }) {
  return <tbody className="divide-y divide-slate-200 bg-white">{children}</tbody>;
}

export function AppTableRow({ children, hover = false }: { children: ReactNode; hover?: boolean }) {
  return <tr className={hover ? "hover:bg-slate-50/80" : undefined}>{children}</tr>;
}

export function AppTableHeading({
  children,
  align = "center",
  className,
}: {
  children: ReactNode;
  align?: TableAlign;
  className?: string;
}) {
  return (
    <th className={cn("px-5 py-4 font-display font-semibold", getAlignClass(align), className)}>
      {children}
    </th>
  );
}

export function AppTableCell({
  children,
  align = "center",
  className,
}: {
  children: ReactNode;
  align?: TableAlign;
  className?: string;
}) {
  return <td className={cn("px-5 py-4", getAlignClass(align), className)}>{children}</td>;
}

export function AppTableEmpty({
  colSpan,
  children,
  align = "center",
  className,
}: {
  colSpan: number;
  children: ReactNode;
  align?: TableAlign;
  className?: string;
}) {
  return (
    <AppTableRow>
      <td
        colSpan={colSpan}
        className={cn("px-5 py-12 text-slate-500", getAlignClass(align), className)}
      >
        {children}
      </td>
    </AppTableRow>
  );
}
