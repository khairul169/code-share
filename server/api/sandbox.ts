import { Router, type Request } from "express";
import sandbox from "../lib/sandbox";
import db from "~/server/db";
import { and, eq, isNull } from "drizzle-orm";
import { project } from "~/server/db/schema/project";
import { unpackProject } from "../lib/unpack-project";
import { APIError } from "~/lib/api";

const router = Router();

router.post("/:slug/start", async (req, res) => {
  const { slug } = req.params as any;
  const data = await getProjectBySlug(slug);
  if (!data) {
    return res.status(404).send("Project not found!");
  }

  try {
    const path = await unpackProject(data);
    const result = await sandbox.start(data.slug, path + "/api");

    if (!result.ok) {
      const body = await result.text();
      throw new APIError(body, result.status);
    }

    res.json({ success: true });
  } catch (err) {
    const error = err as any;
    res
      .status(typeof error?.code === "number" ? error.code : 500)
      .send(error?.message || "An error occured!");
  }
});

router.post("/:slug/stop", async (req, res) => {
  const { slug } = req.params as any;
  const data = await getProjectBySlug(slug);
  if (!data) {
    return res.status(404).send("Project not found!");
  }

  try {
    await sandbox.stop(data.slug);
    res.json({ success: true });
  } catch (err) {
    res.status(500).send("An error occured!");
  }
});

router.post("/:slug/restart", async (req, res) => {
  const { slug } = req.params as any;
  const data = await getProjectBySlug(slug);
  if (!data) {
    return res.status(404).send("Project not found!");
  }

  try {
    await unpackProject(data);
    const result = await sandbox.restart(data.slug);

    if (!result.ok) {
      const body = await result.text();
      throw new APIError(body, result.status);
    }

    res.json({ success: true });
  } catch (err) {
    const error = err as any;
    res
      .status(typeof error?.code === "number" ? error.code : 500)
      .send(error?.message || "An error occured!");
  }
});

router.get("/:slug/stats", async (req, res) => {
  const { slug } = req.params as any;
  const data = await getProjectBySlug(slug);
  if (!data) {
    return res.status(404).send("Project not found!");
  }

  try {
    const result = await sandbox.getStats(data.slug);
    res.json({ success: true, result });
  } catch (err) {
    const error = err as any;
    res
      .status(typeof error.code === "number" ? error.code : 500)
      .send(error.message || "An error occured!");
  }
});

router.get("/:slug/logs", async (req, res) => {
  const { slug } = req.params as any;
  const data = await getProjectBySlug(slug);
  if (!data) {
    return res.status(404).send("Project not found!");
  }

  try {
    const { body, headers } = await sandbox.getLogs(data.slug);
    if (!body) {
      throw new Error("No body response.");
    }

    headers.forEach((value, key) => res.setHeader(key, value));
    body.pipe(res);
  } catch (err) {
    res.status(500).send("An error occured!");
  }
});

router.get("/:slug/proxy*", async (req, res) => {
  const params = req.params as any;
  const { slug } = params;
  const pathname = params?.[0];
  const searchParams = new URLSearchParams();

  Object.entries(req.query || {}).forEach(([key, value]) => {
    searchParams.set(key, value as string);
  });

  const data = await getProjectBySlug(slug);
  if (!data) {
    return res.status(404).send("Project not found!");
  }

  try {
    const { body, headers, status } = await sandbox.proxy(data.slug, {
      pathname: pathname + "?" + searchParams.toString(),
      headers: getHeadersFromReq(req),
    });

    if (!body) {
      throw new Error("No body response.");
    }

    headers.forEach((value, key) => res.setHeader(key, value));
    res.status(status);
    body.pipe(res);
  } catch (err) {
    const error = err as any;
    res
      .status(typeof error?.code === "number" ? error.code : 500)
      .send(error?.message || "An error occured!");
  }
});

function getHeadersFromReq(req: Request) {
  const headers = new Headers();

  for (const [key, value] of Object.entries(req.headers)) {
    if (typeof value === "string") {
      headers.set(key, value);
    } else if (Array.isArray(value)) {
      value.forEach((val) => headers.append(key, val));
    }
  }

  return headers;
}

async function getProjectBySlug(slug: string) {
  return db.query.project.findFirst({
    where: and(eq(project.slug, slug), isNull(project.deletedAt)),
  });
}

export default router;
