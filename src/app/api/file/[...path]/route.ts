import { getFileExt } from "@/lib/utils";
import db from "@/server/db";
import { file } from "@/server/db/schema/file";
import { and, eq, isNull } from "drizzle-orm";
import { NextRequest } from "next/server";

const handler = async (req: NextRequest, { params }: any) => {
  const path = params.path.join("/");
  const { searchParams } = new URL(req.url);

  const fileData = await db.query.file.findFirst({
    where: and(eq(file.path, path), isNull(file.deletedAt)),
  });

  if (!fileData) {
    return new Response("File not found!", { status: 404 });
  }

  let content = fileData.content || "";

  if (searchParams.get("index") === "true") {
    content = `<!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <script src="https://cdn.tailwindcss.com"></script>
      <title>Code-Share</title>
      <link rel="stylesheet" href="styles.css">
      <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
    </head>
    <body>
      ${content}

      <script>
      if (window.parent !== window) {
        const _log = console.log;
        const _error = console.error;
        const _warn = console.warn;

        console.log = function (...args) {
          parent.window.postMessage({ type: "log", args: args }, "*");
          _log(...args);
        };
        console.error = function (...args) {
          parent.window.postMessage({ type: "error", args: args }, "*");
          _error(...args);
        };
        console.warn = function (...args) {
          parent.window.postMessage({ type: "warn", args: args }, "*");
          _warn(...args);
        };
      }
      </script>
      <script type="text/babel" src="script.js" data-type="module"></script>
    </body>
    </html>`;
  }

  return new Response(content, {
    headers: {
      "Content-Type": getFileMimetype(fileData.filename),
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  });
};

function getFileMimetype(filename: string) {
  const ext = getFileExt(filename);

  switch (ext) {
    case "html":
      return "text/html";
    case "css":
      return "text/css";
    case "js":
    case "jsx":
      return "text/javascript";
  }

  return "application/octet-stream";
}

export { handler as GET };
