import { createSearchParams, generatePath, useNavigate } from "react-router-dom";

type SearchValue = string | number | boolean | null | undefined;

type BuildPathOptions = {
  params?: Record<string, string | number>;
  search?: Record<string, SearchValue>;
};

type NavigateOptions = BuildPathOptions & {
  replace?: boolean;
};

export function buildPath(path: string, options?: BuildPathOptions) {
  const pathname = options?.params
    ? generatePath(
        path,
        Object.fromEntries(
          Object.entries(options.params).map(([key, value]) => [key, String(value)]),
        ),
      )
    : path;

  if (!options?.search) {
    return pathname;
  }

  const searchEntries: Array<[string, string]> = Object.entries(options.search).flatMap(
    ([key, value]) => {
      if (value === null || value === undefined || value === "") {
        return [];
      }

      return [[key, String(value)]];
    },
  );

  const search = createSearchParams(searchEntries).toString();

  return search ? `${pathname}?${search}` : pathname;
}

export function useAppNavigate() {
  const navigate = useNavigate();

  return (path: string, options?: NavigateOptions) =>
    navigate(buildPath(path, options), { replace: options?.replace });
}
