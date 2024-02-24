import { Request, Response } from "express";
import { screenshot } from "../lib/screenshot";

const cache = new Map<string, { data: Buffer; timestamp: number }>();

const regenerateThumbnail = async (slug: string) => {
  const curCache = cache.get(slug);

  if (curCache?.data) {
    cache.set(slug, {
      data: curCache.data,
      timestamp: Date.now(),
    });
  }

  const result = await screenshot(slug);
  if (!result) {
    return curCache;
  }

  const data = {
    data: result,
    timestamp: Date.now(),
  };

  cache.set(slug, data);
  return data;
};

export const thumbnail = async (req: Request, res: Response) => {
  const { slug } = req.params;
  let cacheData = cache.get(slug);

  if (!cacheData) {
    cacheData = await regenerateThumbnail(slug);
  }

  if (cacheData && Date.now() - cacheData.timestamp > 10000) {
    regenerateThumbnail(slug);
  }

  res.contentType("image/jpeg");
  res.send(cacheData?.data);
};
