import * as React from "react";
import { Link } from "react-router-dom";
import { Pencil, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import type { Client as ClientRecord } from "@/features/clients/clients.schemas";

const STATUS_STYLES: Record<ClientRecord["status"], React.ComponentProps<typeof Badge>["variant"]> =
  {
    active: "success",
    inactive: "warning",
    completed: "dark",
    rejected: "destructive",
  };

function ModuleCard({
  title,
  description,
  to,
  stat,
}: {
  title: string;
  description: string;
  to: string;
  stat: string;
}) {
  return (
    <Link
      to={to}
      className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm transition hover:border-slate-300 hover:shadow-md"
    >
      <div className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">Module</div>
      <h3 className="mt-3 text-2xl font-display font-extrabold text-slate-950">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-slate-500">{description}</p>
      <div className="mt-5 flex items-center justify-between">
        <Badge variant="dark">{stat}</Badge>
        <span className="text-sm font-semibold text-gold">Open</span>
      </div>
    </Link>
  );
}

export function Panel({
  title,
  subtitle,
  children,
  action,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <section className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm xl:p-6">
      <div className="mb-5 flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
        <div>
          <h2 className="text-2xl font-display font-extrabold text-slate-950">{title}</h2>
          {subtitle ? <p className="mt-2 text-sm leading-6 text-slate-500">{subtitle}</p> : null}
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}

function KpiCard({
  title,
  value,
  detail,
}: {
  title: string;
  value: number | string;
  detail: string;
}) {
  return (
    <div className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm">
      <div className="text-sm font-medium text-slate-500">{title}</div>
      <div className="mt-3 text-4xl font-display font-extrabold text-slate-950">{value}</div>
      <div className="mt-4 rounded-2xl bg-slate-50 px-3 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
        {detail}
      </div>
    </div>
  );
}

function StatusPill({ status }: { status: ClientRecord["status"] }) {
  return <Badge variant={STATUS_STYLES[status]}>{status.replace("_", " ")}</Badge>;
}

export function EmptyHint({
  message,
  tone = "default",
  loading = false,
}: {
  message: string;
  tone?: "default" | "error";
  loading?: boolean;
}) {
  return (
    <div
      className={`rounded-[24px] border px-5 py-12 text-center text-sm ${
        tone === "error"
          ? "border-destructive/20 bg-destructive/10 text-destructive"
          : "border-slate-200 bg-slate-50 text-slate-500"
      }`}
      aria-busy={loading}
      aria-live={loading ? "polite" : undefined}
    >
      {loading ? (
        <div className="mx-auto mb-4 flex w-full max-w-sm flex-col gap-3">
          <Skeleton className="h-4 w-28 self-center rounded-full bg-slate-200" />
          <Skeleton className="h-4 w-full rounded-full bg-slate-200" />
          <Skeleton className="h-4 w-3/4 self-center rounded-full bg-slate-200" />
        </div>
      ) : null}
      <span>{message}</span>
    </div>
  );
}

export function TableToolbar({
  searchValue,
  onSearchChange,
  searchPlaceholder,
  summary,
}: {
  searchValue: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder: string;
  summary?: string;
}) {
  return (
    <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
      <input
        type="search"
        value={searchValue}
        onChange={(event) => onSearchChange(event.target.value)}
        placeholder={searchPlaceholder}
        className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none md:max-w-sm"
      />
      {summary ? (
        <div className="text-sm font-medium text-slate-500 md:text-right">{summary}</div>
      ) : null}
    </div>
  );
}

export function PaginationControls({
  page,
  totalPages,
  total,
  pageSize,
  onPageChange,
}: {
  page: number;
  totalPages: number;
  total: number;
  pageSize: number;
  onPageChange: (page: number) => void;
}) {
  const start = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const end = total === 0 ? 0 : Math.min(total, page * pageSize);

  return (
    <div className="mt-4 flex flex-col gap-3 border-t border-slate-200 pt-4 md:flex-row md:items-center md:justify-between">
      <p className="text-sm text-slate-500">
        Showing {start}-{end} of {total}
      </p>
      <div className="flex items-center justify-end gap-2">
        <button
          type="button"
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Previous
        </button>
        <span className="text-sm font-medium text-slate-600">
          Page {Math.min(page, totalPages)} of {totalPages}
        </span>
        <button
          type="button"
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
          className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  );
}

function ActionButtons({ onEdit, onDelete }: { onEdit: () => void; onDelete: () => void }) {
  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={onEdit}
        className="inline-flex h-10 w-10 items-center justify-center text-slate-600 transition"
        aria-label="Edit"
      >
        <Pencil className="h-4 w-4" />
      </button>
      <button
        type="button"
        onClick={onDelete}
        className="inline-flex h-10 w-10 items-center justify-center text-destructive transition"
        aria-label="Delete"
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </div>
  );
}

export function Field({
  label,
  value,
  onChange,
  type = "text",
  required,
  disabled,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  required?: boolean;
  disabled?: boolean;
}) {
  return (
    <div>
      <label className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
        {label}
      </label>
      <input
        type={type}
        required={required}
        disabled={disabled}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-2 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none disabled:cursor-not-allowed disabled:bg-slate-100"
      />
    </div>
  );
}
