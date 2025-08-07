# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.0.4] - 2025-08-07

### Added

- 🚀 **Automatic Locale Detection**: Integrated `detectLocale` function for automatic locale detection from `Accept-Language` headers
- 🧪 **Comprehensive Testing**: Added complete unit test suite with 33 test cases covering all functionality
- 🏷️ **Enhanced Namespace Support**: Improved namespace handling with better fallback behavior
- 🔧 **Parameter Interpolation**: Enhanced parameter handling with proper null/undefined support
- 📝 **Quality Values Support**: Added support for quality values (`q` parameters) in Accept-Language headers
- 🎯 **TypeScript Types**: Added `DefaultLocale` type with predefined locale constants
- 📚 **Documentation**: Complete README with examples and API reference
- ⚡ **Testing Infrastructure**: Added Vitest for testing with comprehensive test coverage

### Changed

- 🔄 **BREAKING**: Changed API from `languages/defaultLanguage` to `locales/defaultLocale`
- 🔄 **BREAKING**: Updated parameter interpolation behavior to preserve null/undefined as placeholders
- 📦 **Dependencies**: Added Vitest as testing dependency

### Removed

- 🗑️ **BREAKING**: Removed standalone `parseIntl` function in favor of middleware-integrated approach
- 🗑️ Removed deprecated `intl.ts` file

### Fixed

- 🐛 Parameter interpolation now properly handles null and undefined values
- 🐛 Namespace behavior improved for missing keys
- 🐛 Better fallback handling for unsupported locales

## [0.0.3] - Previous Release

### Fixed

- Build declaration configuration

## [0.0.2] - Previous Release

### Added

- Code structure refactoring
- Improved readability and maintainability

## [0.0.1] - Initial Release

### Added

- Basic internationalization middleware for Hono
- TypeScript support
- Message interpolation
- Namespace support
