import { createIntlMiddleware } from "../middleware";
import { en_us } from "./messages/en_us";
import { fr } from "./messages/fr";
import { id } from "./messages/id";

export const intl = createIntlMiddleware({
  locales: ["en-US", "id-ID", "fr-FR"],
  defaultLocale: "en-US",
  messages: {
    "id-ID": id,
    "en-US": en_us,
    "fr-FR": fr,
  },
});
