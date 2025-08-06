import { Hono } from "hono";
import { serve } from "@hono/node-server";

import { intlMiddleware } from "./intl.middleware";

const app = new Hono().get("/", intlMiddleware("global"), async (c) => {
  return c.json({
    message: c.get("intl").get("welcome"),
  });
});

serve(
  {
    fetch: app.fetch,
    port: 3000,
  },
  () => {
    console.log("Server is running on http://localhost:3000");
  }
);
