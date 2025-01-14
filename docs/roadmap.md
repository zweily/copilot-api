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

## Phase 3: Vision and Streaming
- [ ] Add support for image/vision capabilities
  - [ ] Implement vision API endpoints
  - [ ] Handle image uploads and processing
  - [ ] Convert between Copilot and OpenAI vision formats
- [x] Implement true streaming responses
  - [x] Server-sent events (SSE) support
  - [x] Streaming chat completions
  - [x] Proper error handling for streams

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

