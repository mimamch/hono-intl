import { createIntlMiddleware } from "../middleware";
import { en_us } from "./messages/en_us";
import { fr } from "./messages/fr";
import { id } from "./messages/id";

export const intlMiddleware = createIntlMiddleware<typeof en_us>({
  languages: ["en", "fr", "id"],
  defaultLanguage: "en",
  messages: {
    en: en_us,
    fr: fr,
    id: id,
  },
});
