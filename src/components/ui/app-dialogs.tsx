import { useMemo, useRef, useState, type ReactNode } from "react";
import { AppDialog } from "@/components/ui/app-dialog";
import {
  AppDialogsContext,
  type AppDialogsContextValue,
  type ConfirmOptions,
  type PromptOptions,
} from "@/components/ui/app-dialogs-context";

export function AppDialogsProvider({ children }: { children: ReactNode }) {
  const [confirmState, setConfirmState] = useState<(ConfirmOptions & { open: boolean }) | null>(
    null,
  );
  const [promptState, setPromptState] = useState<(PromptOptions & { open: boolean }) | null>(null);
  const [promptValue, setPromptValue] = useState("");
  const confirmResolverRef = useRef<((value: boolean) => void) | null>(null);
  const promptResolverRef = useRef<((value: string | null) => void) | null>(null);

  const value = useMemo<AppDialogsContextValue>(
    () => ({
      confirm: (options) =>
        new Promise<boolean>((resolve) => {
          confirmResolverRef.current = resolve;
          setConfirmState({
            open: true,
            confirmLabel: "Confirm",
            cancelLabel: "Cancel",
            tone: "default",
            ...options,
          });
        }),
      prompt: (options) =>
        new Promise<string | null>((resolve) => {
          promptResolverRef.current = resolve;
          setPromptValue(options.defaultValue ?? "");
          setPromptState({
            open: true,
            confirmLabel: "Continue",
            cancelLabel: "Cancel",
            tone: "default",
            ...options,
          });
        }),
    }),
    [],
  );

  const closeConfirm = (result: boolean) => {
    confirmResolverRef.current?.(result);
    confirmResolverRef.current = null;
    setConfirmState(null);
  };

  const closePrompt = (result: string | null) => {
    promptResolverRef.current?.(result);
    promptResolverRef.current = null;
    setPromptState(null);
    setPromptValue("");
  };

  return (
    <AppDialogsContext.Provider value={value}>
      {children}

      <AppDialog
        open={confirmState?.open ?? false}
        onOpenChange={(open) => !open && closeConfirm(false)}
        title={confirmState?.title ?? ""}
        description={confirmState?.description}
        contentClassName="max-w-md rounded-[28px]"
        bodyClassName="flex justify-end gap-3 py-5"
      >
        <button
          type="button"
          onClick={() => closeConfirm(false)}
          className="rounded-2xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
        >
          {confirmState?.cancelLabel}
        </button>
        <button
          type="button"
          onClick={() => closeConfirm(true)}
          className={
            confirmState?.tone === "destructive"
              ? "rounded-2xl bg-destructive px-4 py-2.5 text-sm font-semibold text-white transition hover:opacity-90"
              : "btn-gold"
          }
        >
          {confirmState?.confirmLabel}
        </button>
      </AppDialog>

      <AppDialog
        open={promptState?.open ?? false}
        onOpenChange={(open) => !open && closePrompt(null)}
        title={promptState?.title ?? ""}
        description={promptState?.description}
        contentClassName="max-w-md rounded-[28px]"
        bodyClassName="py-5"
      >
        <form
          className="space-y-4"
          onSubmit={(event) => {
            event.preventDefault();
            closePrompt(promptValue);
          }}
        >
          <label className="block space-y-2">
            <span className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
              {promptState?.label || "Value"}
            </span>
            <input
              autoFocus
              value={promptValue}
              onChange={(event) => setPromptValue(event.target.value)}
              placeholder={promptState?.placeholder}
              className="h-12 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm outline-none focus:border-slate-300"
            />
          </label>
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={() => closePrompt(null)}
              className="rounded-2xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              {promptState?.cancelLabel}
            </button>
            <button
              type="submit"
              className={
                promptState?.tone === "destructive"
                  ? "rounded-2xl bg-destructive px-4 py-2.5 text-sm font-semibold text-white transition hover:opacity-90"
                  : "btn-gold"
              }
            >
              {promptState?.confirmLabel}
            </button>
          </div>
        </form>
      </AppDialog>
    </AppDialogsContext.Provider>
  );
}
