import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { applySeoTags, getRouteSeoPayload } from "@/lib/seo";

export function SeoHead() {
  const location = useLocation();

  useEffect(() => {
    applySeoTags(getRouteSeoPayload(location.pathname));
  }, [location.pathname]);

  return null;
}
