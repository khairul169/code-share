import type { Config } from "vike/types";

export default {
  clientRouting: true,
  passToClient: ["routeParams", "cookies"],
  meta: {
    title: {
      env: { server: true, client: true },
    },
    description: {
      env: { server: true },
    },
  },
  hydrationCanBeAborted: true,
} satisfies Config;
