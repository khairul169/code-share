import express from "express";
import db from "../db";
import { and, eq, isNull } from "drizzle-orm";
import { file } from "../db/schema/file";
import * as swc from "@swc/core";

const app = express();

const getFileByPath = async (path: string) => {
  const fileData = await db.query.file.findFirst({
    where: and(eq(file.path, path), isNull(file.deletedAt)),
  });

  return fileData;
};

app.get("/file/*", async (req, res) => {
  const pathname = Object.values(req.params).join("/");
  const fileData = await getFileByPath(pathname);

  if (!fileData) {
    return res.status(404).send("File not found!");
  }

  try {
    let code = fileData.content || "";
    const result = await swc.transform(code, {
      jsc: {
        parser: {
          jsx: true,
          syntax: "ecmascript",
        },
        target: "es5",
      },
    });

    res.contentType("text/javascript").send(result.code);
  } catch (err) {
    console.log(err);
    return res.status(400).send("Cannot transform file!");
  }
});

app.listen(3001, () => {
  console.log("App listening on http://localhost:3001");
});
