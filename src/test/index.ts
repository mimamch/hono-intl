import { Hono } from "hono";
import { serve } from "@hono/node-server";

import { intlMiddleware } from "./intl.middleware";

const app = new Hono().get("/", intlMiddleware("nested"), async (c) => {
  return c.json({
    message: c.get("intl").get("deeper.value"),
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
