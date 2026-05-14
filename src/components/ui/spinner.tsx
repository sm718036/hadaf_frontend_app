import { cn } from "@/lib/utils";

type SpinnerProps = {
  className?: string;
  size?: "sm" | "md" | "lg";
  label?: string;
};

const sizeClasses = {
  sm: "h-6 w-6",
  md: "h-10 w-10",
  lg: "h-14 w-14",
} as const;

export function SpinnerTwo({ className, size = "md", label = "Loading" }: SpinnerProps) {
  return (
    <div
      className={cn(
        "relative inline-flex items-center justify-center",
        sizeClasses[size],
        className,
      )}
    >
      <span className="sr-only">{label}</span>
      <span className="absolute inset-0 rounded-full border-[3px] border-dark/12" />
      <span className="absolute inset-0 animate-spin rounded-full border-[3px] border-transparent border-r-primary border-t-primary" />
      <span className="absolute inset-[22%] animate-spin rounded-full border-[3px] border-transparent border-b-dark border-l-dark [animation-direction:reverse] [animation-duration:0.8s]" />
    </div>
  );
}
