import { Request, Response } from "express";
import { screenshot } from "../lib/screenshot";

const cache = new Map<string, Buffer>();

export const thumbnail = async (req: Request, res: Response) => {
  const { slug } = req.params;
  const cacheData = cache.get(slug);

  if (cacheData) {
    res.contentType("image/jpeg");
    return res.send(cacheData);
  }

  const result = await screenshot(slug);
  if (!result) {
    return res.status(400).send("Cannot generate thumbnail!");
  }

  cache.set(slug, result);

  res.contentType("image/jpeg");
  res.send(result);
};
