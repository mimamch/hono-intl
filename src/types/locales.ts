export const defaultLocales = [
  "en-US", // English (United States)
  "en-GB", // English (United Kingdom)
  "en-AU", // English (Australia)
  "en-CA", // English (Canada)
  "en-IN", // English (India)

  "id-ID", // Indonesian (Indonesia)
  "ms-MY", // Malay (Malaysia)

  "zh-CN", // Chinese (Simplified, China)
  "zh-TW", // Chinese (Traditional, Taiwan)
  "zh-HK", // Chinese (Traditional, Hong Kong)

  "ja-JP", // Japanese (Japan)
  "ko-KR", // Korean (Korea)
  "th-TH", // Thai (Thailand)
  "vi-VN", // Vietnamese (Vietnam)

  "fr-FR", // French (France)
  "fr-CA", // French (Canada)
  "es-ES", // Spanish (Spain)
  "es-MX", // Spanish (Mexico)
  "pt-PT", // Portuguese (Portugal)
  "pt-BR", // Portuguese (Brazil)
  "de-DE", // German (Germany)
  "it-IT", // Italian (Italy)
  "nl-NL", // Dutch (Netherlands)
  "ru-RU", // Russian (Russia)
  "tr-TR", // Turkish (Turkey)

  "ar-SA", // Arabic (Saudi Arabia)
  "he-IL", // Hebrew (Israel)
  "hi-IN", // Hindi (India)
  "bn-BD", // Bengali (Bangladesh)
  "ta-IN", // Tamil (India)
  "ur-PK", // Urdu (Pakistan)
] as const;

export type DefaultLocale = (typeof defaultLocales)[number];
