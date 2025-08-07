export function detectLocale(
  acceptLanguage: string | null | undefined,
  supportedLocales: string[],
  defaultLocale: string
): string {
  if (!acceptLanguage) return defaultLocale;

  const accepted = acceptLanguage
    .split(",")
    .map((lang) => {
      const [code, qValue] = lang.trim().split(";q=");
      return {
        code: code.toLowerCase(),
        quality: qValue ? parseFloat(qValue) : 1,
      };
    })
    .sort((a, b) => b.quality - a.quality);

  const supported = supportedLocales.map((l) => l.toLowerCase());

  for (const lang of accepted) {
    // Full match
    const fullMatchIndex = supported.indexOf(lang.code);
    if (fullMatchIndex !== -1) return supportedLocales[fullMatchIndex];

    // Base language match
    const base = lang.code.split("-")[0];
    const partialMatchIndex = supported.findIndex((s) => s.startsWith(base));
    if (partialMatchIndex !== -1) return supportedLocales[partialMatchIndex];
  }

  return defaultLocale;
}
