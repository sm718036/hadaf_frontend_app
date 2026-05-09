import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";
import { siteContentService } from "./site-content.service";

export function useSiteContent(enabled = true) {
  return useQuery({
    queryKey: queryKeys.siteContent.public,
    queryFn: ({ signal }) => siteContentService.getPublicContent(signal),
    enabled,
    staleTime: 10 * 60_000,
    gcTime: 30 * 60_000,
    refetchOnMount: false,
  });
}

export function useUpdateSiteContent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: siteContentService.updateContent,
    onSuccess: (data) => {
      queryClient.setQueryData(queryKeys.siteContent.public, data);
    },
  });
}

export function useUploadSiteContentImage() {
  return useMutation({
    mutationFn: siteContentService.uploadImage,
  });
}
