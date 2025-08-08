import { Hono } from "hono";
import { serve } from "@hono/node-server";

import { intl } from "./intl.middleware";

const app = new Hono().get("/", intl(), async (c) => {
  return c.json({
    message: c.get("intl").get("global.welcome"),
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
