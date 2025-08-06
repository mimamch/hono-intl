import { createMiddleware } from "hono/factory";
import { NestedKeys } from "./intl";
import { HonoRequest } from "hono";
import {
  MessageKeys,
  NamespacedMessageKeys,
  NamespacedValue,
  NamespaceKeys,
  NestedKeyOf,
  NestedValueOf,
} from "./types/message-keys";

type Variables<Keys> = {
  intl: {
    get: (key: Keys, params?: Record<string, any>) => string;
  };
};

export const createIntlMiddleware = <
  Message,
  Messages extends Record<Language, Message> = Record<string, Message>,
  Language extends string = string
>(props: {
  languages: Language[];
  defaultLanguage: Language;
  messages: Messages;
  selectLanguage?: (request: { headers: Record<string, unknown> }) => Language;
}) => {
  const middleware = <
    N extends
      | NamespaceKeys<Message, NestedKeyOf<Message>>
      | undefined = undefined
  >(
    namespace?: N
  ) =>
    createMiddleware<{
      Variables: Variables<
        // condition if NestedKey is provided
        N extends undefined
          ? MessageKeys<Message, NestedKeyOf<Message>>
          : NamespacedMessageKeys<Message, N>
      >;
    }>(async (c, next) => {
      const selectLanguage =
        props.selectLanguage || (() => props.defaultLanguage);
      const language = selectLanguage({
        headers: c.req.header(),
      });
      const messages =
        props.messages[language] || props.messages[props.defaultLanguage];

      if (!messages) {
        throw new Error(
          `No messages found for language: ${language}. Please provide messages for this language.`
        );
      }
      c.set("intl", {
        get: (key, params) => {
          // If namespace is provided, we need to resolve the key within that namespace
          const fullKey: string =
            namespace !== undefined ? `${namespace}.${key}` : key;

          const message = getMessage(messages, fullKey);

          return message.replace(/\{(\w+)\}/g, (match: string, k: string) =>
            String((params ?? {})[k] ?? match)
          );
        },
      });

      await next();
    });

  return middleware;
};

const getMessage = (message: any, key: any): string => {
  const keys = key.split(".");
  let msg: any = message;

  for (const k of keys) {
    if (msg[k] === undefined) {
      return key; // Return the original key if not found
    }
    msg = msg[k];
  }

  return msg;
};
