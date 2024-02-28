import "dotenv/config";
import express from "express";
import { renderPage } from "vike/server";
import { IS_DEV } from "./lib/consts";
import cookieParser from "cookie-parser";
import api from "./api";
import { authMiddleware } from "./middlewares/auth";

async function createServer() {
  const app = express();
  const root = process.cwd();

  if (IS_DEV) {
    // start vite development server
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      root,
      server: { middlewareMode: true },
      appType: "custom",
    });

    app.use(vite.middlewares);
  } else {
    // serve client assets
    app.use(express.static(root + "/dist/client"));

    const { default: morgan } = await import("morgan");
    app.use(morgan("combined"));
  }

  app.set("etag", false);
  app.use(cookieParser());
  app.use(authMiddleware);

  app.use("/api", api);

  app.use("*", async (req, res, next) => {
    const url = req.originalUrl;
    const pageContext = { req, res, cookies: req.cookies, user: req.user };
    const ctx = await renderPage({ urlOriginal: url, ...pageContext });

    const { httpResponse } = ctx;
    if (!httpResponse) {
      return next();
    }

    const { body, statusCode, headers, earlyHints } = httpResponse;

    // FIXME: SSL cloudflare gak bisa digunakan kalo ada ini..
    // if (res.writeEarlyHints) {
    //   res.writeEarlyHints({ link: earlyHints.map((e) => e.earlyHintLink) });
    // }

    headers.forEach(([name, value]) => res.setHeader(name, value));
    res.status(statusCode).send(body);
  });

  const host = process.env.HOST || "127.0.0.1";
  const port = Number(process.env.PORT) || 3000;

  app.listen(port, host, () => {
    console.log(`Server listening on http://${host}:${port}`);
  });
}

createServer();
