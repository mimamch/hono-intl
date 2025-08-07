import { describe, it, expect } from "vitest";
import { detectLocale } from "./detect-locale";

describe("detectLocale", () => {
  const supportedLocales = ["en-US", "id", "fr-FR"];

  it("returns correct locale from full match", () => {
    const result = detectLocale("id", supportedLocales, "en-US");
    expect(result).toBe("id");
  });

  it("returns correct locale from partial match", () => {
    const result = detectLocale("fr", supportedLocales, "en-US");
    expect(result).toBe("fr-FR");
  });

  it("respects quality values (q=)", () => {
    const result = detectLocale(
      "fr-FR;q=0.7,en-US;q=0.9",
      supportedLocales,
      "id"
    );
    expect(result).toBe("en-US");
  });

  it("returns fallback if no match found", () => {
    const result = detectLocale("de-DE,ja-JP", supportedLocales, "en-US");
    expect(result).toBe("en-US");
  });

  it("returns fallback if header is null", () => {
    const result = detectLocale(null, supportedLocales, "en-US");
    expect(result).toBe("en-US");
  });

  it("is case-insensitive when matching", () => {
    const result = detectLocale("EN-us", supportedLocales, "fr-FR");
    expect(result).toBe("en-US");
  });

  it("matches base language if full match not found", () => {
    const result = detectLocale("fr-CA", supportedLocales, "en-US");
    expect(result).toBe("fr-FR");
  });
});
