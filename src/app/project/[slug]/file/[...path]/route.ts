import { getFileExt } from "@/lib/utils";
import db from "@/server/db";
import { file } from "@/server/db/schema/file";
import { and, eq, isNull } from "drizzle-orm";
import { NextRequest } from "next/server";
import { serveHtml } from "./serve-html";
import { Mime } from "mime/lite";
import standardTypes from "mime/types/standard.js";
import otherTypes from "mime/types/other.js";
import { serveJs } from "./serve-js";

const mime = new Mime(standardTypes, otherTypes);
mime.define({ "text/javascript": ["jsx", "tsx"] }, true);

// Opt out of caching for all data requests in the route segment
export const dynamic = "force-dynamic";

export const GET = async (req: NextRequest, { params }: any) => {
  const path = params.path.join("/");
  const { slug } = params;

  const fileData = await db.query.file.findFirst({
    where: and(eq(file.path, path), isNull(file.deletedAt)),
  });

  if (!fileData) {
    return new Response("File not found!", { status: 404 });
  }

  const ext = getFileExt(fileData.filename);
  let content = fileData.content || "";

  if (["html", "htm"].includes(ext)) {
    content = await serveHtml(fileData);
  }

  if (["js", "ts", "jsx", "tsx"].includes(ext)) {
    content = await serveJs(fileData, slug);
  }

  return new Response(content, {
    headers: {
      "Content-Type":
        mime.getType(fileData.filename) || "application/octet-stream",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  });
};
