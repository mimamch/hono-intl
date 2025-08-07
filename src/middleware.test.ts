import { describe, it, expect } from "vitest";
import { Hono } from "hono";
import { createIntlMiddleware } from "./middleware";

describe("createIntlMiddleware", () => {
  const testMessages = {
    "en-US": {
      global: {
        welcome: "Welcome to our application!",
        goodbye: "Thank you for visiting!",
        user_greeting: "Hello {name}!",
        complex_message: "You have {count} new {type} in your {location}.",
      },
      errors: {
        not_found: "The requested resource was not found.",
        server_error: "An unexpected error occurred. Please try again later.",
        validation_error: "Field {field} is required.",
      },
      nested: {
        deep: {
          message: "This is a deeply nested message",
        },
      },
    },
    "id-ID": {
      global: {
        welcome: "Selamat datang di aplikasi kami!",
        goodbye: "Terima kasih telah mengunjungi!",
        user_greeting: "Halo {name}!",
        complex_message:
          "Anda memiliki {count} {type} baru di {location} Anda.",
      },
      errors: {
        not_found: "Sumber daya yang diminta tidak ditemukan.",
        server_error:
          "Terjadi kesalahan yang tidak terduga. Silakan coba lagi nanti.",
        validation_error: "Field {field} wajib diisi.",
      },
      nested: {
        deep: {
          message: "Ini adalah pesan yang sangat dalam",
        },
      },
    },
    "fr-FR": {
      global: {
        welcome: "Bienvenue dans notre application!",
        goodbye: "Merci de votre visite!",
        user_greeting: "Bonjour {name}!",
        complex_message:
          "Vous avez {count} nouveau {type} dans votre {location}.",
      },
      errors: {
        not_found: "La ressource demandée est introuvable.",
        server_error:
          "Une erreur inattendue s'est produite. Veuillez réessayer plus tard.",
        validation_error: "Le champ {field} est requis.",
      },
      nested: {
        deep: {
          message: "Ceci est un message profondément imbriqué",
        },
      },
    },
  };

  const createTestMiddleware = (
    selectLocale?: (request: {
      headers: Record<string, unknown>;
    }) => "en-US" | "id-ID" | "fr-FR"
  ) => {
    return createIntlMiddleware({
      locales: ["en-US", "id-ID", "fr-FR"],
      defaultLocale: "en-US",
      messages: testMessages,
      selectLocale,
    });
  };

  describe("basic functionality", () => {
    it("should create middleware function", () => {
      const middleware = createTestMiddleware();
      expect(typeof middleware).toBe("function");
      expect(typeof middleware()).toBe("function");
    });

    it("should use default locale when no selectLocale is provided", async () => {
      const middleware = createTestMiddleware();
      const app = new Hono().get("/", middleware("global"), async (c) => {
        return c.json({
          message: c.get("intl").get("welcome"),
        });
      });

      const res = await app.request("/");
      const data = await res.json();

      expect(data.message).toBe("Welcome to our application!");
    });

    it("should work without namespace", async () => {
      const middleware = createTestMiddleware();
      const app = new Hono().get("/", middleware(), async (c) => {
        return c.json({
          message: c.get("intl").get("global.welcome"),
        });
      });

      const res = await app.request("/");
      const data = await res.json();

      expect(data.message).toBe("Welcome to our application!");
    });
  });

  describe("locale selection", () => {
    it("should use custom selectLocale function", async () => {
      const middleware = createTestMiddleware(() => "id-ID");
      const app = new Hono().get("/", middleware("global"), async (c) => {
        return c.json({
          welcome: c.get("intl").get("welcome"),
          goodbye: c.get("intl").get("goodbye"),
        });
      });

      const res = await app.request("/");
      const data = await res.json();

      expect(data.welcome).toBe("Selamat datang di aplikasi kami!");
      expect(data.goodbye).toBe("Terima kasih telah mengunjungi!");
    });

    it("should use French locale when selected", async () => {
      const middleware = createTestMiddleware(() => "fr-FR");
      const app = new Hono().get("/", middleware("global"), async (c) => {
        return c.json({
          welcome: c.get("intl").get("welcome"),
          goodbye: c.get("intl").get("goodbye"),
        });
      });

      const res = await app.request("/");
      const data = await res.json();

      expect(data.welcome).toBe("Bienvenue dans notre application!");
      expect(data.goodbye).toBe("Merci de votre visite!");
    });

    it("should pass headers to selectLocale function", async () => {
      let receivedHeaders: Record<string, unknown> = {};

      const middleware = createTestMiddleware(({ headers }) => {
        receivedHeaders = headers;
        const acceptLanguage = headers["accept-language"] as string;
        if (acceptLanguage?.includes("id")) return "id-ID";
        if (acceptLanguage?.includes("fr")) return "fr-FR";
        return "en-US";
      });

      const app = new Hono().get("/", middleware("global"), async (c) => {
        return c.json({
          message: c.get("intl").get("welcome"),
        });
      });

      await app.request("/", {
        headers: { "Accept-Language": "id-ID,id;q=0.9,en;q=0.8" },
      });

      expect(receivedHeaders["accept-language"]).toBe(
        "id-ID,id;q=0.9,en;q=0.8"
      );
    });
  });

  describe("namespace functionality", () => {
    it("should work with different namespaces", async () => {
      const middleware = createTestMiddleware();
      const app = new Hono()
        .get("/global", middleware("global"), async (c) => {
          return c.json({
            welcome: c.get("intl").get("welcome"),
            goodbye: c.get("intl").get("goodbye"),
          });
        })
        .get("/errors", middleware("errors"), async (c) => {
          return c.json({
            not_found: c.get("intl").get("not_found"),
            server_error: c.get("intl").get("server_error"),
          });
        });

      const globalRes = await app.request("/global");
      const globalData = await globalRes.json();
      expect(globalData.welcome).toBe("Welcome to our application!");
      expect(globalData.goodbye).toBe("Thank you for visiting!");

      const errorsRes = await app.request("/errors");
      const errorsData = await errorsRes.json();
      expect(errorsData.not_found).toBe(
        "The requested resource was not found."
      );
      expect(errorsData.server_error).toBe(
        "An unexpected error occurred. Please try again later."
      );
    });

    it("should handle nested namespaces", async () => {
      const middleware = createTestMiddleware();
      const app = new Hono().get("/", middleware("nested"), async (c) => {
        return c.json({
          // Using any to test nested access - in real usage TypeScript would handle this
          message: (c.get("intl") as any).get("deep.message"),
        });
      });

      const res = await app.request("/");
      const data = await res.json();

      expect(data.message).toBe("This is a deeply nested message");
    });
  });

  describe("parameter interpolation", () => {
    it("should replace single parameter", async () => {
      const middleware = createTestMiddleware();
      const app = new Hono().get("/", middleware("global"), async (c) => {
        return c.json({
          message: c.get("intl").get("user_greeting", { name: "John" }),
        });
      });

      const res = await app.request("/");
      const data = await res.json();

      expect(data.message).toBe("Hello John!");
    });

    it("should replace multiple parameters", async () => {
      const middleware = createTestMiddleware();
      const app = new Hono().get("/", middleware("global"), async (c) => {
        return c.json({
          message: c.get("intl").get("complex_message", {
            count: "5",
            type: "messages",
            location: "inbox",
          }),
        });
      });

      const res = await app.request("/");
      const data = await res.json();

      expect(data.message).toBe("You have 5 new messages in your inbox.");
    });

    it("should leave placeholder unchanged when parameter is missing", async () => {
      const middleware = createTestMiddleware();
      const app = new Hono().get("/", middleware("global"), async (c) => {
        return c.json({
          message: c.get("intl").get("complex_message", {
            count: "5",
            type: "messages",
            // location parameter missing
          }),
        });
      });

      const res = await app.request("/");
      const data = await res.json();

      expect(data.message).toBe("You have 5 new messages in your {location}.");
    });

    it("should handle parameters with different locales", async () => {
      const middleware = createTestMiddleware(() => "id-ID");
      const app = new Hono().get("/", middleware("errors"), async (c) => {
        return c.json({
          message: c.get("intl").get("validation_error", { field: "email" }),
        });
      });

      const res = await app.request("/");
      const data = await res.json();

      expect(data.message).toBe("Field email wajib diisi.");
    });

    it("should convert non-string parameters to strings", async () => {
      const middleware = createTestMiddleware();
      const app = new Hono().get("/", middleware("global"), async (c) => {
        return c.json({
          message: c.get("intl").get("complex_message", {
            count: 42, // number
            type: true, // boolean
            location: null, // null
          }),
        });
      });

      const res = await app.request("/");
      const data = await res.json();

      // null parameters should remain as placeholders, not converted to "null"
      expect(data.message).toBe("You have 42 new true in your {location}.");
    });
  });

  describe("fallback behavior", () => {
    it("should fallback to default locale when selected locale is not available", async () => {
      const middleware = createTestMiddleware(() => "es-ES" as any); // Locale tidak tersedia
      const app = new Hono().get("/", middleware("global"), async (c) => {
        return c.json({
          message: c.get("intl").get("welcome"),
        });
      });

      const res = await app.request("/");
      const data = await res.json();

      // Should fallback to default English
      expect(data.message).toBe("Welcome to our application!");
    });

    it("should return original key when message is not found", async () => {
      const middleware = createTestMiddleware();
      const app = new Hono().get("/", middleware("global"), async (c) => {
        return c.json({
          // Using any to bypass TypeScript checking for testing
          message: (c.get("intl") as any).get("non_existent_key"),
        });
      });

      const res = await app.request("/");
      const data = await res.json();

      expect(data.message).toBe("non_existent_key");
    });

    it("should return full key when accessing non-existent nested key", async () => {
      const middleware = createTestMiddleware();
      const app = new Hono().get("/", middleware(), async (c) => {
        return c.json({
          // Using any to bypass TypeScript checking for testing
          message: (c.get("intl") as any).get("non_existent.nested.key"),
        });
      });

      const res = await app.request("/");
      const data = await res.json();

      expect(data.message).toBe("non_existent.nested.key");
    });

    it("should handle empty messages object gracefully", async () => {
      const emptyMiddleware = createIntlMiddleware({
        locales: ["en-US"],
        defaultLocale: "en-US",
        messages: {
          "en-US": {},
        },
      });

      const app = new Hono().get("/", emptyMiddleware(), async (c) => {
        return c.json({
          // Using any to bypass TypeScript checking for testing
          message: (c.get("intl") as any).get("any.key"),
        });
      });

      const res = await app.request("/");
      const data = await res.json();

      expect(data.message).toBe("any.key");
    });
  });

  describe("middleware integration", () => {
    it("should work in middleware chain", async () => {
      const middleware = createTestMiddleware();
      let middlewareExecuted = false;

      const app = new Hono()
        .use("/api/*", async (c, next) => {
          middlewareExecuted = true;
          await next();
        })
        .get("/api/messages", middleware("global"), async (c) => {
          return c.json({
            message: c.get("intl").get("welcome"),
          });
        });

      const res = await app.request("/api/messages");
      const data = await res.json();

      expect(middlewareExecuted).toBe(true);
      expect(data.message).toBe("Welcome to our application!");
    });

    it("should not affect response status", async () => {
      const middleware = createTestMiddleware();
      const app = new Hono().get("/", middleware("global"), async (c) => {
        return c.json(
          {
            message: c.get("intl").get("welcome"),
          },
          201
        );
      });

      const res = await app.request("/");
      expect(res.status).toBe(201);
    });

    it("should work with different HTTP methods", async () => {
      const middleware = createTestMiddleware();
      const app = new Hono()
        .post("/", middleware("global"), async (c) => {
          return c.json({
            message: c.get("intl").get("welcome"),
          });
        })
        .put("/", middleware("errors"), async (c) => {
          return c.json({
            error: c.get("intl").get("server_error"),
          });
        })
        .delete("/", middleware("global"), async (c) => {
          return c.json({
            message: c.get("intl").get("goodbye"),
          });
        });

      const postRes = await app.request("/", { method: "POST" });
      const postData = await postRes.json();
      expect(postData.message).toBe("Welcome to our application!");

      const putRes = await app.request("/", { method: "PUT" });
      const putData = await putRes.json();
      expect(putData.error).toBe(
        "An unexpected error occurred. Please try again later."
      );

      const deleteRes = await app.request("/", { method: "DELETE" });
      const deleteData = await deleteRes.json();
      expect(deleteData.message).toBe("Thank you for visiting!");
    });
  });

  describe("real-world scenarios", () => {
    it("should automatically detect locale from Accept-Language header", async () => {
      // Create middleware without custom selectLocale (uses default detectLocale behavior)
      const middleware = createTestMiddleware(); // No selectLocale parameter

      const app = new Hono().get("/", middleware("global"), async (c) => {
        return c.json({
          message: c.get("intl").get("welcome"),
        });
      });

      // Test with Indonesian Accept-Language header - should detect and use Indonesian
      const idRes = await app.request("/", {
        headers: { "Accept-Language": "id-ID,id;q=0.9,en;q=0.8" },
      });
      const idData = await idRes.json();
      expect(idData.message).toBe("Selamat datang di aplikasi kami!"); // Should be Indonesian

      // Test with French Accept-Language header - should detect and use French
      const frRes = await app.request("/", {
        headers: { "Accept-Language": "fr-FR,fr;q=0.9,en;q=0.8" },
      });
      const frData = await frRes.json();
      expect(frData.message).toBe("Bienvenue dans notre application!"); // Should be French

      // Test with English Accept-Language header - should use English
      const enRes = await app.request("/", {
        headers: { "Accept-Language": "en-US,en;q=0.9" },
      });
      const enData = await enRes.json();
      expect(enData.message).toBe("Welcome to our application!"); // Should be English

      // Test without any Accept-Language header - should use default (en-US)
      const noHeaderRes = await app.request("/");
      const noHeaderData = await noHeaderRes.json();
      expect(noHeaderData.message).toBe("Welcome to our application!"); // Should be English (default)

      // Test with unsupported locale - should fallback to default (en-US)
      const unsupportedRes = await app.request("/", {
        headers: { "Accept-Language": "de-DE,ja-JP" },
      });
      const unsupportedData = await unsupportedRes.json();
      expect(unsupportedData.message).toBe("Welcome to our application!"); // Should fallback to English
    });

    it("should handle API responses with automatic locale detection", async () => {
      // Create middleware without custom selectLocale (uses default detectLocale behavior)
      const middleware = createTestMiddleware(); // No selectLocale parameter

      const app = new Hono().post(
        "/api/users",
        middleware("errors"),
        async (c) => {
          return c.json(
            {
              error: c
                .get("intl")
                .get("validation_error", { field: "username" }),
            },
            400
          );
        }
      );

      // Test with English Accept-Language header - should use English
      const enRes = await app.request("/api/users", {
        method: "POST",
        headers: { "Accept-Language": "en-US,en;q=0.9" },
      });
      const enData = await enRes.json();
      expect(enData.error).toBe("Field username is required.");
      expect(enRes.status).toBe(400);

      // Test with Indonesian Accept-Language header - should use Indonesian
      const idRes = await app.request("/api/users", {
        method: "POST",
        headers: { "Accept-Language": "id-ID,id;q=0.9,en;q=0.8" },
      });
      const idData = await idRes.json();
      expect(idData.error).toBe("Field username wajib diisi."); // Should be Indonesian
      expect(idRes.status).toBe(400);

      // Test without Accept-Language header - should use default (English)
      const noHeaderRes = await app.request("/api/users", {
        method: "POST",
      });
      const noHeaderData = await noHeaderRes.json();
      expect(noHeaderData.error).toBe("Field username is required."); // Should be English (default)
      expect(noHeaderRes.status).toBe(400);

      // Test with French Accept-Language header - should use French
      const frRes = await app.request("/api/users", {
        method: "POST",
        headers: { "Accept-Language": "fr-FR,fr;q=0.9" },
      });
      const frData = await frRes.json();
      expect(frData.error).toBe("Le champ username est requis."); // Should be French
      expect(frRes.status).toBe(400);
    });

    it("should respect quality values in Accept-Language header", async () => {
      const middleware = createTestMiddleware();
      const app = new Hono().get("/", middleware("global"), async (c) => {
        return c.json({
          message: c.get("intl").get("welcome"),
        });
      });

      // Test with quality values - English has higher priority (q=0.9) than French (q=0.7)
      const res = await app.request("/", {
        headers: { "Accept-Language": "fr-FR;q=0.7,en-US;q=0.9,id-ID;q=0.5" },
      });
      const data = await res.json();
      expect(data.message).toBe("Welcome to our application!"); // Should prioritize English

      // Test with quality values - Indonesian has highest priority (q=0.9)
      const res2 = await app.request("/", {
        headers: { "Accept-Language": "en-US;q=0.5,id-ID;q=0.9,fr-FR;q=0.7" },
      });
      const data2 = await res2.json();
      expect(data2.message).toBe("Selamat datang di aplikasi kami!"); // Should prioritize Indonesian
    });

    it("should handle multiple middleware instances with different configurations", async () => {
      const globalMiddleware = createTestMiddleware(() => "en-US");
      const userSpecificMiddleware = createTestMiddleware(() => "id-ID");

      const app = new Hono()
        .get("/global", globalMiddleware("global"), async (c) => {
          return c.json({
            message: c.get("intl").get("welcome"),
          });
        })
        .get("/user", userSpecificMiddleware("global"), async (c) => {
          return c.json({
            message: c.get("intl").get("welcome"),
          });
        });

      const globalRes = await app.request("/global");
      const globalData = await globalRes.json();
      expect(globalData.message).toBe("Welcome to our application!");

      const userRes = await app.request("/user");
      const userData = await userRes.json();
      expect(userData.message).toBe("Selamat datang di aplikasi kami!");
    });
  });

  describe("error handling", () => {
    it("should handle missing messages gracefully", async () => {
      const incompleteMiddleware = createIntlMiddleware({
        locales: ["en-US", "missing-locale"],
        defaultLocale: "en-US",
        messages: {
          "en-US": {
            test: { message: "English message" },
          },
          // "missing-locale" tidak didefinisikan
        } as any,
      });

      const app = new Hono().get("/", incompleteMiddleware(), async (c) => {
        return c.json({
          // Using any to bypass TypeScript checking for testing
          message: (c.get("intl") as any).get("test.message"),
        });
      });

      const res = await app.request("/");
      const data = await res.json();

      expect(data.message).toBe("English message");
    });

    it("should handle complex nested object access", async () => {
      const nestedMiddleware = createTestMiddleware();
      const app = new Hono().get("/", nestedMiddleware(), async (c) => {
        return c.json({
          // Using any to bypass TypeScript checking for testing
          message: (c.get("intl") as any).get("nested.deep.message"),
        });
      });

      const res = await app.request("/");
      const data = await res.json();

      expect(data.message).toBe("This is a deeply nested message");
    });
  });
});
