import { apiFormRequest, apiRequest } from "@/lib/api";
import type { SiteContent } from "./site-content.schemas";

type UploadedImageAsset = {
  src: string;
  contentType: string;
  size: number;
  fileName: string;
};

export const siteContentService = {
  getPublicContent: (signal?: AbortSignal) =>
    apiRequest<SiteContent>("/api/site-content", { signal }),
  updateContent: (input: SiteContent) =>
    apiRequest<SiteContent>("/api/site-content", { method: "PUT", body: input }),
  uploadImage: (file: File) => {
    const formData = new FormData();
    formData.set("file", file);

    return apiFormRequest<UploadedImageAsset>("/api/uploads/site-content-image", {
      method: "POST",
      formData,
    });
  },
};
