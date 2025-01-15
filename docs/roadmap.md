# Development Roadmap

## MVP Phase: Basic Compatibility
- [x] OpenAI-compatible API endpoint implementation
- [x] Basic chat completions support
- [x] Token management and authentication
- [x] Error handling and logging
- [x] Compatible with common coding tools and IDE plugins

## Phase 2: Distribution
- [x] Package as standalone binary
  - [x] Production build with minification
  - [x] Debug build with sourcemaps
- [ ] Cross-platform support
  - [ ] Windows compatibility
  - [ ] macOS compatibility
  - [x] Linux compatibility

## Phase 3: Feature Support Notes
- ❌ Image/Vision Support
  - Not planned as GitHub Copilot API does not support image input
  - This limitation is inherent to Copilot's API capabilities

## Completed Features
- [x] Streaming Support
  - [x] Server-sent events (SSE) implementation
  - [x] Streaming chat completions
  - [x] Proper error handling for streams
  - [x] Configurable via CLI flags

## Build Instructions

### Production Build
```bash
bun run scripts/build.ts
```
Creates minified executable at `dist/copilot-api`

### Debug Build
```bash
bun run scripts/build-debug.ts
```
Creates executable with sourcemaps at `dist/copilot-api-debug`

