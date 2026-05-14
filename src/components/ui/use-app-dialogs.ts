import { useContext } from "react";
import { AppDialogsContext } from "@/components/ui/app-dialogs-context";

export function useAppDialogs() {
  const context = useContext(AppDialogsContext);

  if (!context) {
    throw new Error("useAppDialogs must be used within AppDialogsProvider.");
  }

  return context;
}
