import type { Config } from "vike/types";

export default {
  clientRouting: true,
  passToClient: ["routeParams", "cookies", "user"],
  meta: {
    title: {
      env: { server: true, client: true },
    },
    description: {
      env: { server: true },
    },
    Layout: {
      env: { server: true, client: true },
    },
  },
  hydrationCanBeAborted: true,
} satisfies Config;
