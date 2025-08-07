# 🌍 Hono Internationalization (i18n) Library

A powerful and type-safe internationalization (i18n) middleware for [Hono](https://hono.dev/) applications. Features automatic locale detection, namespace support, and seamless TypeScript integration.

[![npm version](https://img.shields.io/npm/v/hono-intl.svg)](https://www.npmjs.com/package/hono-intl)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue.svg)](https://www.typescriptlang.org/)

## ✨ Features

- 🚀 **Easy Integration** - Simple setup with Hono applications
- 🔍 **Automatic Locale Detection** - Detects user locale from `Accept-Language` headers
- 🏷️ **Namespace Support** - Organize translations by feature/module
- 🔒 **Type Safety** - Full TypeScript support with autocomplete
- 📝 **Parameter Interpolation** - Dynamic message content with placeholders
- 🎯 **Quality Values Support** - Respects `q` values in Accept-Language headers
- 🔄 **Fallback System** - Graceful fallback to default locale
- ⚡ **Lightweight** - Minimal dependencies and bundle size

## 📦 Installation

```bash
npm install hono-intl
# or
pnpm add hono-intl
# or
yarn add hono-intl
```

## 🚀 Quick Start

### 1. Create Message Files

```typescript
// messages/en-US.ts
export const enUS = {
  global: {
    welcome: "Welcome to our application!",
    goodbye: "Thank you for visiting!",
    greeting: "Hello {name}!",
  },
  errors: {
    notFound: "Resource not found",
    serverError: "Something went wrong",
  },
};

// messages/id-ID.ts
export const idID = {
  global: {
    welcome: "Selamat datang di aplikasi kami!",
    goodbye: "Terima kasih telah mengunjungi!",
    greeting: "Halo {name}!",
  },
  errors: {
    notFound: "Sumber daya tidak ditemukan",
    serverError: "Terjadi kesalahan",
  },
};
```

### 2. Setup Middleware

```typescript
import { Hono } from "hono";
import { createIntlMiddleware } from "hono-intl";
import { enUS } from "./messages/en-US";
import { idID } from "./messages/id-ID";

// Create middleware
const intlMiddleware = createIntlMiddleware({
  locales: ["en-US", "id-ID"],
  defaultLocale: "en-US",
  messages: {
    "en-US": enUS,
    "id-ID": idID,
  },
});

const app = new Hono();
```

### 3. Use in Routes

```typescript
// With namespace
app.get("/", intlMiddleware("global"), async (c) => {
  return c.json({
    welcome: c.get("intl").get("welcome"),
    greeting: c.get("intl").get("greeting", { name: "John" }),
  });
});

// Without namespace (access full key path)
app.get("/status", intlMiddleware(), async (c) => {
  return c.json({
    message: c.get("intl").get("global.welcome"),
  });
});
```

## 📋 API Reference

### `createIntlMiddleware(options)`

Creates an internationalization middleware for Hono applications.

#### Options

| Parameter       | Type                     | Required | Description                          |
| --------------- | ------------------------ | -------- | ------------------------------------ |
| `locales`       | `string[]`               | ✅       | Array of supported locale codes      |
| `defaultLocale` | `string`                 | ✅       | Default locale to use as fallback    |
| `messages`      | `Record<string, object>` | ✅       | Translation messages for each locale |
| `selectLocale`  | `function`               | ❌       | Custom locale selection function     |

#### Returns

A middleware function that can be used with or without namespaces.

### Middleware Usage

```typescript
// With namespace - access keys directly within the namespace
intlMiddleware("global");

// Without namespace - access full key paths
intlMiddleware();
```

### Translation API

Once the middleware is applied, you can access translations via `c.get("intl")`:

```typescript
const intl = c.get("intl");

// Simple message
const message = intl.get("welcome");

// Message with parameters
const greeting = intl.get("greeting", { name: "Alice" });

// Nested message
const error = intl.get("errors.notFound");
```

## 🌐 Automatic Locale Detection

By default, the middleware automatically detects the user's preferred locale from the `Accept-Language` header:

```http
Accept-Language: id-ID,id;q=0.9,en;q=0.8
```

The middleware will:

1. Parse quality values (`q` parameters)
2. Sort by preference (highest `q` value first)
3. Match against supported locales
4. Support both exact matches (`id-ID`) and base language matches (`id` → `id-ID`)
5. Fallback to `defaultLocale` if no match found

### Custom Locale Selection

You can provide a custom locale selection function:

```typescript
const intlMiddleware = createIntlMiddleware({
  locales: ["en-US", "id-ID", "fr-FR"],
  defaultLocale: "en-US",
  messages: {
    /* ... */
  },
  selectLocale: ({ headers }) => {
    // Custom logic based on headers, user preferences, etc.
    const userLang = headers["x-user-language"];
    if (userLang === "indonesian") return "id-ID";
    if (userLang === "french") return "fr-FR";
    return "en-US";
  },
});
```

## 🏷️ Namespace Support

Organize your translations by features or modules using namespaces:

```typescript
const messages = {
  "en-US": {
    auth: {
      login: "Log In",
      logout: "Log Out",
      forgotPassword: "Forgot Password?",
    },
    dashboard: {
      welcome: "Welcome back!",
      stats: "Your Statistics",
    },
  },
};

// Use with specific namespace
app.post("/login", intlMiddleware("auth"), async (c) => {
  return c.json({
    button: c.get("intl").get("login"), // Gets "auth.login"
    link: c.get("intl").get("forgotPassword"), // Gets "auth.forgotPassword"
  });
});
```

## 🔧 Parameter Interpolation

Support dynamic content with parameter placeholders:

```typescript
const messages = {
  "en-US": {
    user: {
      welcome: "Welcome back, {name}!",
      itemCount: "You have {count} {type} in your {location}",
      notification: "Hello {user}, you have {count} new messages",
    },
  },
};

app.get("/profile", intlMiddleware("user"), async (c) => {
  return c.json({
    welcome: c.get("intl").get("welcome", { name: "Alice" }),
    items: c.get("intl").get("itemCount", {
      count: 5,
      type: "items",
      location: "cart",
    }),
  });
});
```

### Parameter Handling Rules

- **Missing parameters**: Placeholder remains unchanged (`{name}`)
- **Null/undefined values**: Placeholder remains unchanged
- **Other values**: Converted to string using `String(value)`

```typescript
// Example with missing parameter
intl.get("Hello {name}!", { age: 25 }); // "Hello {name}!"

// Example with null value
intl.get("Hello {name}!", { name: null }); // "Hello {name}!"

// Example with number value
intl.get("Count: {count}", { count: 42 }); // "Count: 42"
```

## 🔄 Fallback Behavior

The middleware provides multiple levels of fallback:

1. **Locale Fallback**: If selected locale is unavailable, use `defaultLocale`
2. **Message Fallback**: If message key is not found, return the key itself
3. **Namespace Fallback**: If using namespace and key not found, return key without namespace prefix

```typescript
// If message doesn't exist
intl.get("nonexistent.key"); // Returns "nonexistent.key"

// With namespace - if "welcome" doesn't exist in "auth" namespace
intlMiddleware("auth");
intl.get("welcome"); // Returns "welcome" (not "auth.welcome")
```

## 💡 Real-World Examples

### API Error Responses

```typescript
app.post("/api/users", intlMiddleware("errors"), async (c) => {
  try {
    // ... user creation logic
  } catch (error) {
    return c.json(
      {
        error: c.get("intl").get("validation", { field: "email" }),
      },
      400
    );
  }
});
```

### Multi-language API

```typescript
app.get("/api/products", intlMiddleware("products"), async (c) => {
  const products = await getProducts();

  return c.json({
    title: c.get("intl").get("title"),
    description: c.get("intl").get("description"),
    products: products.map((p) => ({
      ...p,
      statusText: c.get("intl").get(`status.${p.status}`),
    })),
  });
});
```

### Headers-based Locale Detection

```typescript
// Client sends: Accept-Language: id-ID,id;q=0.9,en;q=0.8
app.get("/welcome", intlMiddleware("global"), async (c) => {
  return c.json({
    message: c.get("intl").get("welcome"), // Will be in Indonesian
  });
});
```

## 🎯 TypeScript Support

Full TypeScript support with autocomplete for message keys:

```typescript
// TypeScript will provide autocomplete for available keys
const message = c.get("intl").get("global.welcome"); // ✅ Autocomplete
const error = c.get("intl").get("invalid.key"); // ❌ TypeScript error
```

## 🧪 Testing

The library includes comprehensive tests. Run them with:

```bash
npm test
# or
pnpm test
```

## 📝 Examples

Check out the `/src/example` directory for a complete working example with:

- Message file organization
- Middleware setup
- Route implementation
- Namespace usage

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

MIT License - see the [LICENSE](LICENSE) file for details.

## 🔗 Links

- [Hono Framework](https://hono.dev/)
- [NPM Package](https://www.npmjs.com/package/hono-intl)
- [GitHub Repository](https://github.com/mimamch/hono-intl)

---

Made with ❤️ for the Hono community
