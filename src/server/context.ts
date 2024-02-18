import { headers as getHeaders, cookies as getCookies } from "next/headers";

export const createContext = async () => {
  //   const headers = getHeaders();
  //   const cookies = getCookies();

  return {};
};

export type Context = Awaited<ReturnType<typeof createContext>>;
