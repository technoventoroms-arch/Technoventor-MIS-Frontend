import { useCallback, useState } from "react";

type LoadingHook<T extends string> = T extends ""
  ? {
      loading: boolean;
      showLoading: () => void;
      hideLoading: () => void;
    }
  : {
      [K in `${T}loading`]: boolean;
    } & {
      [K in `show${Capitalize<T>}Loading`]: () => void;
    } & {
      [K in `hide${Capitalize<T>}Loading`]: () => void;
    };

export const useLoading = <T extends string = "">(
  loaderName?: T
): LoadingHook<T> => {
  const [loading, setLoading] = useState(false);
  const showLoading = useCallback(() => {
    setLoading(true);
  }, []);
  const hideLoading = useCallback(() => {
    setLoading(false);
  }, []);
  return {
    [(loaderName || "") + "loading"]: loading,
    [`show${loaderName || ""}Loading`]: showLoading,
    [`hide${loaderName || ""}Loading`]: hideLoading,
  } as LoadingHook<T>;
};
