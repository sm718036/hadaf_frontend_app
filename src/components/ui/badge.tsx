import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center justify-center gap-1 rounded-full border px-2.5 py-1 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default: "border-transparent bg-primary text-primary-foreground shadow-sm",
        primary: "border-transparent bg-primary text-primary-foreground shadow-sm",
        success: "border-transparent bg-emerald-600 text-white shadow-sm",
        warning: "border-transparent bg-amber-500 text-dark shadow-sm",
        info: "border-transparent bg-sky-600 text-white shadow-sm",
        dark: "border-transparent bg-dark text-white shadow-sm",
        destructive: "border-transparent bg-destructive text-destructive-foreground shadow-sm",
        light: "border-slate-200 bg-white text-slate-700 shadow-sm",
        secondary: "border-transparent bg-secondary text-secondary-foreground shadow-sm",
        outline: "text-foreground",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge };
