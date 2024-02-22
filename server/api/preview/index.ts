import { type Request, type Response, Router } from "express";
import { getFileExt } from "~/lib/utils";
import db from "~/server/db";
import { file } from "~/server/db/schema/file";
import { and, eq, isNull } from "drizzle-orm";
import { serveHtml } from "./serve-html";
import { serveJs } from "./serve-js";
import { getMimeType } from "~/server/lib/mime";
import { postcss } from "./postcss";

const get = async (req: Request, res: Response) => {
  const { slug, ...pathParams } = req.params as any;
  const path = pathParams[0];

  const fileData = await db.query.file.findFirst({
    where: and(eq(file.path, path), isNull(file.deletedAt)),
  });

  if (!fileData) {
    return res.status(404).send("File not found!");
  }

  const ext = getFileExt(fileData.filename);
  let content = fileData.content || "";

  if (["html", "htm"].includes(ext)) {
    content = await serveHtml(fileData);
  }

  if (["js", "ts", "jsx", "tsx"].includes(ext)) {
    content = await serveJs(fileData);
  }

  if (["css"].includes(ext)) {
    content = await postcss(fileData);
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
