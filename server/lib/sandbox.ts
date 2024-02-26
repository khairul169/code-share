import fetch, { RequestInit } from "node-fetch";

const createRequest = async (
  url: string,
  options?: RequestInit & { ignoreError?: boolean }
) => {
  const reqUrl = "http://127.0.0.1:8000" + url;
  const response = await fetch(reqUrl, options);

  if (!response.ok && !options?.ignoreError) {
    const err: any = Error(response.statusText);
    err.code = response.status;
    throw err;
  }

  return response;
};

const start = async (id: string, path: string) => {
  return createRequest("/start", {
    body: JSON.stringify({ path, id }),
    method: "POST",
    ignoreError: true,
  });
};

const stop = async (id: string) => {
  const res = await createRequest(`/stop/${id}`, { method: "POST" });
  return res.json();
};

const restart = async (id: string) => {
  return createRequest(`/restart/${id}`, { method: "POST", ignoreError: true });
};

const getStats = async (id: string) => {
  const res = await createRequest(`/stats/${id}`);
  return res.json();
};

const getLogs = async (id: string) => {
  return createRequest(`/logs/${id}`);
};

type ProxyOptions = {
  pathname: string;
  headers: Headers;
};

const proxy = async (id: string, opt: ProxyOptions) => {
  return createRequest(`/proxy/${id}` + opt.pathname, {
    headers: opt.headers,
    ignoreError: true,
  });
};

const sandbox = {
  start,
  stop,
  restart,
  getStats,
  getLogs,
  proxy,
};

export default sandbox;
