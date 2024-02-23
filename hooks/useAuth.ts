import { usePageContext } from "~/renderer/context";

export const useAuth = () => {
  const { user } = usePageContext();

  return { user, isLoggedIn: user != null };
};
