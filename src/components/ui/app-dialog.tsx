import type { ReactNode } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

type AppDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: ReactNode;
  description?: ReactNode;
  children: ReactNode;
  contentClassName?: string;
  headerClassName?: string;
  bodyClassName?: string;
};

export function AppDialog({
  open,
  onOpenChange,
  title,
  description,
  children,
  contentClassName,
  headerClassName,
  bodyClassName,
}: AppDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={cn("border-slate-200 bg-white p-0", contentClassName)}>
        <DialogHeader className={cn("border-b border-slate-200 px-6 py-5", headerClassName)}>
          <DialogTitle className="font-display text-2xl font-extrabold text-slate-950">
            {title}
          </DialogTitle>
          {description ? (
            <DialogDescription className="text-sm leading-6 text-slate-500">
              {description}
            </DialogDescription>
          ) : null}
        </DialogHeader>
        <div className={cn("px-6 py-6", bodyClassName)}>{children}</div>
      </DialogContent>
    </Dialog>
  );
}
