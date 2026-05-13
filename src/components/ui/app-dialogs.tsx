import { createContext, useContext, useMemo, useRef, useState, type ReactNode } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type ConfirmOptions = {
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  tone?: "default" | "destructive";
};

type PromptOptions = {
  title: string;
  description?: string;
  label?: string;
  defaultValue?: string;
  placeholder?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  tone?: "default" | "destructive";
};

type AppDialogsContextValue = {
  confirm: (options: ConfirmOptions) => Promise<boolean>;
  prompt: (options: PromptOptions) => Promise<string | null>;
};

const AppDialogsContext = createContext<AppDialogsContextValue | null>(null);

export function AppDialogsProvider({ children }: { children: ReactNode }) {
  const [confirmState, setConfirmState] = useState<(ConfirmOptions & { open: boolean }) | null>(null);
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

      <Dialog open={confirmState?.open ?? false} onOpenChange={(open) => !open && closeConfirm(false)}>
        <DialogContent className="max-w-md rounded-[28px] border border-slate-200 bg-white p-0">
          <DialogHeader className="border-b border-slate-200 px-6 py-5">
            <DialogTitle className="font-display text-2xl font-extrabold text-slate-950">
              {confirmState?.title}
            </DialogTitle>
            {confirmState?.description ? (
              <DialogDescription className="text-sm text-slate-500">
                {confirmState.description}
              </DialogDescription>
            ) : null}
          </DialogHeader>
          <div className="flex justify-end gap-3 px-6 py-5">
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
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={promptState?.open ?? false} onOpenChange={(open) => !open && closePrompt(null)}>
        <DialogContent className="max-w-md rounded-[28px] border border-slate-200 bg-white p-0">
          <DialogHeader className="border-b border-slate-200 px-6 py-5">
            <DialogTitle className="font-display text-2xl font-extrabold text-slate-950">
              {promptState?.title}
            </DialogTitle>
            {promptState?.description ? (
              <DialogDescription className="text-sm text-slate-500">
                {promptState.description}
              </DialogDescription>
            ) : null}
          </DialogHeader>
          <form
            className="space-y-4 px-6 py-5"
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
        </DialogContent>
      </Dialog>
    </AppDialogsContext.Provider>
  );
}

export function useAppDialogs() {
  const context = useContext(AppDialogsContext);

  if (!context) {
    throw new Error("useAppDialogs must be used within AppDialogsProvider.");
  }

  return context;
}
