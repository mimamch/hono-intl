import { createIntlMiddleware } from "../middleware";
import { MessageKeys, NamespaceKeys, NestedKeyOf } from "../types/message-keys";

const en_us = {
  greeting: "Hello",
  farewell: "Goodbye",
  nested: {
    key: "Nested Key",
    deeper: {
      value: "Deeper Value",
    },
  },
};

type Message = typeof en_us;
type AA = MessageKeys<Message, NestedKeyOf<Message>>;
const a: AA = "nested.deeper.value";

export const intlMiddleware = createIntlMiddleware<typeof en_us>({
  languages: ["en", "fr", "es"],
  defaultLanguage: "en",
  messages: {
    en: en_us,
    fr: en_us,
    es: en_us,
  },
});
