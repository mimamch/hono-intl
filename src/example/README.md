# Hono Intl Examples

This directory contains working examples of how to use `hono-intl` in different scenarios.

## Basic Example

See `index.ts` for a simple server setup with internationalization.

## Files Structure

```
example/
├── index.ts              # Main server file
├── intl.middleware.ts    # Middleware configuration
└── messages/             # Translation files
    ├── en_us.ts         # English messages
    ├── id.ts            # Indonesian messages
    └── fr.ts            # French messages
```

## Running the Example

```bash
# Install dependencies
pnpm install

# Run the development server
npx tsx src/example/index.ts
```

Then visit `http://localhost:3000` and test with different `Accept-Language` headers:

```bash
# English (default)
curl http://localhost:3000

# Indonesian
curl -H "Accept-Language: id-ID" http://localhost:3000

# French
curl -H "Accept-Language: fr-FR" http://localhost:3000

# With quality values
curl -H "Accept-Language: fr-FR;q=0.7,en-US;q=0.9,id-ID;q=0.5" http://localhost:3000
```

## Features Demonstrated

- ✅ Automatic locale detection from Accept-Language headers
- ✅ Namespace usage (`global` namespace)
- ✅ Message parameter interpolation
- ✅ Fallback to default locale
- ✅ TypeScript type safety
