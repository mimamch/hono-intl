/**
 *
 * @param key object key to access the message, example: "auth.success_login"
 * @returns the message string for the given key, or object key if not found
 */
type Join<K, P> = K extends string | number
  ? P extends string | number
    ? `${K}.${P}`
    : never
  : never;

export type NestedKeys<T> = {
  [K in keyof T]: T[K] extends object ? Join<K, NestedKeys<T[K]>> : K;
}[keyof T];

const getMessage = (
  message: Record<string, any>,
  key: NestedKeys<Record<string, any>>
) => {
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

type Params = Record<string, any> | undefined;

export const parseIntl = <Message extends Record<string, any>>(
  message: Message,
  key: NestedKeys<Message>,
  parameters?: Params
): string => {
  // @ts-ignore
  return getMessage(message, key).replace(
    /\{(\w+)\}/g,
    (match: string, k: string) => String((parameters ?? {})[k] ?? match)
  );
};
