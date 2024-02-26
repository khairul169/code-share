import { type Request, type Response, Router } from "express";
import { getFileExt } from "~/lib/utils";
import db from "~/server/db";
import { file } from "~/server/db/schema/file";
import { and, eq, isNull } from "drizzle-orm";
import { serveHtml } from "./serve-html";
import { serveJs } from "./serve-js";
import { getMimeType } from "~/server/lib/mime";
import { postcss } from "./postcss";
import { project } from "~/server/db/schema/project";

const get = async (req: Request, res: Response) => {
  const { slug, ...pathParams } = req.params as any;
  const path = pathParams[0];

  const projectData = await db.query.project.findFirst({
    where: and(eq(project.slug, slug), isNull(project.deletedAt)),
  });
  if (!projectData) {
    return res.status(404).send("Project not found!");
  }
  const settings = projectData.settings || {};

  const fileData = await db.query.file.findFirst({
    where: and(
      eq(file.projectId, projectData.id),
      eq(file.path, path),
      isNull(file.deletedAt)
    ),
  });
  if (!fileData) {
    return res.status(404).send("File not found!");
  }

  const ext = getFileExt(fileData.filename);
  let content = fileData.content || "";

  if (!req.query.raw) {
    if (["html", "htm"].includes(ext)) {
      content = await serveHtml(fileData, settings);
    }

    if (["js", "ts", "jsx", "tsx"].includes(ext)) {
      content = await serveJs(fileData, settings.js);
    }

    if (["css"].includes(ext) && settings.css?.preprocessor === "postcss") {
      content = await postcss(projectData, fileData);
    }
  }

  res.setHeader("Content-Type", getMimeType(fileData.filename));
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.send(content);
};

const router = Router();
router.get("/:slug/*", get);

export default router;
