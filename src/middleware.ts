import { createMiddleware } from "hono/factory";
import {
  MessageKeys,
  NamespacedMessageKeys,
  NamespaceKeys,
  NestedKeyOf,
} from "./types/message-keys";
import {} from "./types/app-config";
import { DefaultLocale } from "./types/locales";
import { detectLocale } from "./detect-locale";

type Variables<Keys> = {
  intl: {
    get: (key: Keys, params?: Record<string, any>) => string;
  };
};

export const createIntlMiddleware = <
  const L extends readonly (DefaultLocale | (string & {}))[],
  const M extends Record<L[number], Record<string, any>>
>(props: {
  locales: L;
  defaultLocale: L[number];
  messages: M;
  selectLocale?: (request: { headers: Record<string, unknown> }) => L[number];
}) => {
  type Message = M[L[number]];
  type AllNamespaces = NamespaceKeys<Message, NestedKeyOf<Message>>;

  return function intlMiddleware<
    N extends AllNamespaces | undefined = undefined
  >(namespace?: N) {
    return createMiddleware<{
      Variables: Variables<
        N extends undefined
          ? MessageKeys<Message, NestedKeyOf<Message>>
          : NamespacedMessageKeys<Message, N>
      >;
    }>(async (c, next) => {
      const selectLocale =
        props.selectLocale ||
        ((request) => {
          const acceptLanguage = request.headers["accept-language"] as string;
          return detectLocale(
            acceptLanguage,
            [...props.locales],
            props.defaultLocale
          ) as L[number];
        });

      const language = selectLocale({
        headers: c.req.header(),
      });

      const messages =
        props.messages[language] || props.messages[props.defaultLocale] || {};

      c.set("intl", {
        get: (key, params) => {
          const fullKey: string =
            namespace !== undefined ? `${namespace}.${key}` : key;

          const message = getMessage(messages, fullKey);

          // If message is the same as fullKey, it means message was not found
          // In case of namespace usage, return just the key without namespace
          if (message === fullKey && namespace !== undefined) {
            return key as string;
          }

          return message.replace(/\{(\w+)\}/g, (match: string, k: string) => {
            const value = (params ?? {})[k];
            // Handle null and undefined explicitly - both should remain as placeholders
            if (value === null || value === undefined) return match;
            return String(value);
          });
        },
      });

      await next();
    });
  };
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
