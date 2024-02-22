import { Router } from "express";
import preview from "./preview";
import trpc from "./trpc/handler";

const api = Router();

api.use("/trpc", trpc);
api.use("/preview", preview);

export default api;
