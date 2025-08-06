export type NestedKeyOf<ObjectType> = ObjectType extends object
  ? {
      [Property in keyof ObjectType]:
        | `${Property & string}`
        | `${Property & string}.${NestedKeyOf<ObjectType[Property]>}`;
    }[keyof ObjectType]
  : never;

export type NestedValueOf<
  ObjectType,
  Path extends string
> = Path extends `${infer Cur}.${infer Rest}`
  ? Cur extends keyof ObjectType
    ? NestedValueOf<ObjectType[Cur], Rest>
    : never
  : Path extends keyof ObjectType
  ? ObjectType[Path]
  : never;

export type NamespaceKeys<ObjectType, AllKeys extends string> = {
  [PropertyPath in AllKeys]: NestedValueOf<
    ObjectType,
    PropertyPath
  > extends string
    ? never
    : PropertyPath;
}[AllKeys];

export type MessageKeys<ObjectType, AllKeys extends string> = {
  [PropertyPath in AllKeys]: NestedValueOf<
    ObjectType,
    PropertyPath
  > extends string
    ? PropertyPath
    : never;
}[AllKeys];

export type NamespacedMessageKeys<
  TranslatorMessages extends IntlMessages,
  Namespace extends NamespaceKeys<
    TranslatorMessages,
    NestedKeyOf<TranslatorMessages>
  > = never
> = MessageKeys<
  NestedValueOf<
    { "!": TranslatorMessages },
    [Namespace] extends [never] ? "!" : `!.${Namespace}`
  >,
  NestedKeyOf<
    NestedValueOf<
      { "!": TranslatorMessages },
      [Namespace] extends [never] ? "!" : `!.${Namespace}`
    >
  >
>;

type IntlMessages = Record<string, any>;

export type NamespacedValue<
  TranslatorMessages extends IntlMessages,
  Namespace extends NamespaceKeys<
    TranslatorMessages,
    NestedKeyOf<TranslatorMessages>
  >,
  TargetKey extends NamespacedMessageKeys<TranslatorMessages, Namespace>
> = NestedValueOf<
  TranslatorMessages,
  [Namespace] extends [never] ? TargetKey : `${Namespace}.${TargetKey}`
>;
