import { usePageContext } from "./context";

export const useData = <T = any>() => {
  const { data } = usePageContext();
  return data as T;
};

export const useParams = <T = any>() => {
  const { routeParams } = usePageContext();
  return (routeParams || {}) as T;
};

export const useSearchParams = () => {
  const { urlParsed } = usePageContext();
  return new URLSearchParams(urlParsed.searchOriginal || "");
};
