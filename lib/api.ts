import { BASE_URL } from "./consts";

export const api = async (url: string, options?: RequestInit) => {
  const res = await fetch(BASE_URL + "/api" + url, options);
  if (!res.ok) {
    const body = await res.text().catch(() => null);
    throw new APIError(body || res.statusText, res.status);
  }

  const contentType = res.headers.get("content-type");
  if (contentType?.includes("application/json")) {
    return res.json();
  }

  return res.text();
};

export class APIError extends Error {
  code: number;

  constructor(message: string, statusCode?: number) {
    super(message);
    this.code = typeof statusCode === "number" ? statusCode : 400;
  }
}
