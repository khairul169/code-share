export const BASE_URL =
  typeof window !== "undefined"
    ? location.protocol + "//" + location.host
    : process.env.BASE_URL || "";
