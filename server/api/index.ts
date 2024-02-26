import { Router } from "express";
import preview from "./preview";
import trpc from "./trpc/handler";
import { thumbnail } from "./thumbnail";
import sandbox from "./sandbox";

const api = Router();

api.use("/trpc", trpc);
api.use("/preview", preview);
api.use("/sandbox", sandbox);

api.get("/thumbnail/:slug", thumbnail);

export default api;
