import { Router } from "express";
import preview from "./preview";
import trpc from "./trpc/handler";
import thumbnail from "./thumbnail";
import sandbox from "./sandbox";
import { nocache } from "../middlewares/nocache";

const api = Router();

api.use("/trpc", trpc);
api.use("/preview", nocache, preview);
api.use("/sandbox", sandbox);
api.use("/thumbnail", thumbnail);

export default api;
