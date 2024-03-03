import { and, eq, isNull } from "drizzle-orm";
import { Request, Response, Router } from "express";
import db from "~/server/db";
import fs from "fs";
import { project } from "~/server/db/schema/project";
import { BASE_URL } from "~/server/lib/consts";
import { screenshot } from "~/server/lib/screenshot";
import { getStorageDir } from "~/server/lib/utils";

export const thumbnail = async (req: Request, res: Response) => {
  const { filename } = req.params;
  const path = getStorageDir("thumbnails", filename);
  const thumbnail = fs.existsSync(path) ? fs.readFileSync(path) : undefined;

  if (!thumbnail) {
    return res.status(404).send("Thumbnail not found!");
  }

  res.setHeader("Content-Type", "image/jpeg");
  res.send(thumbnail);
};

export const generate = async (req: Request, res: Response) => {
  const { slug } = req.params;

  const projectData = await db.query.project.findFirst({
    where: and(eq(project.slug, slug), isNull(project.deletedAt)),
  });

  if (!projectData) {
    return res.status(404).send("Project not found!");
  }

  try {
    const url = `${BASE_URL}/api/preview/${slug}/index.html`;
    const data = await screenshot(url);

    if (!data) {
      throw new Error("Cannot generate thumbnail!");
    }

    const dir = getStorageDir("thumbnails");
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    const filename = `/${slug}.jpg`;
    fs.writeFileSync(dir + filename, data);

    await db
      .update(project)
      .set({ thumbnail: filename })
      .where(eq(project.id, projectData.id));

    res.json({ filename });
  } catch (err) {
    res.status(400).send((err as any)?.message || "An error occured!");
  }
};

const router = Router();
router.get("/:filename", thumbnail);
router.patch("/:slug", generate);

export default router;
