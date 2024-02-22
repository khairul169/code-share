import { getFileExt } from "~/lib/utils";
import db from "~/server/db";
import { file } from "~/server/db/schema/file";
import { and, eq, isNull } from "drizzle-orm";
import { serveHtml } from "./serve-html";
import { Mime } from "mime/lite";
import standardTypes from "mime/types/standard.js";
import otherTypes from "mime/types/other.js";
import { serveJs } from "./serve-js";
import { type Request, type Response, Router } from "express";

const mime = new Mime(standardTypes, otherTypes);
mime.define({ "text/javascript": ["jsx", "tsx"] }, true);

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

  res.setHeader(
    "Content-Type",
    mime.getType(fileData.filename) || "application/octet-stream"
  );
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.send(content);
};

const router = Router();
router.get("/:slug/*", get);

export default router;
