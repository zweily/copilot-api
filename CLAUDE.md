# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

- **Install dependencies**: `bun install`
- **Build**: `bun run build`
- **Dev server (watch)**: `bun run dev`
- **Production start**: `bun run start`
- **Lint**: `bun run lint`
- **Pre-commit lint/fix**: Runs automatically via git hooks (bunx eslint --fix)

## Architecture Overview

- **Entry point**: `src/main.ts` defines CLI subcommands (`start` and `auth`) for the Copilot API server and authentication flow.
- **Server**: `src/server.ts` sets up HTTP routes using Hono, maps OpenAI/Anthropic-compatible endpoints, and handles logging/cors.
- **Routes**: Handlers for chat completions, embeddings, models, and messages are under `src/routes/`, providing API endpoints compatible with OpenAI and Anthropic APIs.
- **Copilot communication**: `src/services/copilot/` contains methods for proxying requests (chat completions, model listing, embeddings) to the GitHub Copilot backend using user tokens.
- **Lib utilities**: `src/lib/` contains configuration, token, model caching, and error handling helpers.
- **Authentication**: `src/auth.ts` provides the CLI handler for authenticating with GitHub, managing required tokens, and persisting them locally.

## API Endpoints

- **OpenAI-compatible**:
  - `POST /v1/chat/completions`
  - `GET /v1/models`
  - `POST /v1/embeddings`
- **Anthropic-compatible**:
  - `POST /v1/messages`
  - `POST /v1/messages/count_tokens`

## Other Notes

- Ensure Bun (>= 1.2.x) is installed for all scripts and local dev.
- Tokens and cache are handled automatically; manual authentication can be forced with the `auth` subcommand.
- No .cursorrules, .github/copilot-instructions.md, or .cursor/rules found, so follow typical TypeScript/Bun/ESLint conventions as seen in this codebase.
