# Project Structure

This document outlines the structure and organization of the Copilot API project.

## Directory Structure

```
├── config/
│   ├── env.ts           # Environment configuration and constants
│   ├── paths.ts         # File system paths configuration
│   └── tokens.ts        # Token management for GitHub and Copilot
├── lib/
│   ├── cache.ts         # Cache implementation for tokens
│   └── initialization.ts # Application initialization logic
├── routes/
│   ├── chat-completions/
│   │   ├── route.ts     # Chat completions endpoint handlers
│   │   └── utils.ts     # Utility functions for chat completions
│   └── models/
│       └── route.ts     # Model list endpoint handlers
├── scripts/
│   ├── build.ts         # Production build script
│   └── build-debug.ts   # Debug build with sourcemaps
├── services/
│   ├── api-instance.ts  # API client configurations
│   └── copilot/
│       ├── chat-completions/
│       │   ├── service.ts           # Chat completion service
│       │   ├── service-streaming.ts # Streaming chat completion service
│       │   ├── types.ts            # Chat completion types
│       │   └── types-streaming.ts  # Streaming response types
│       └── get-models/
│           ├── service.ts        # Model retrieval service
│           └── types.ts          # Model-related types
├── dist/                # Build output directory
├── main.ts             # Application entry point
└── server.ts           # Server configuration and routing
```

## Key Components

### Configuration Layer

- **api.ts**: API endpoint configurations and common headers
- **env.ts**: Environment variables and OAuth configurations
- **paths.ts**: Filesystem paths for cache and resources
- **tokens.ts**: GitHub and Copilot authentication token management

### Core Library

- **cache.ts**: Implements file-based caching system
- **initialization.ts**: Handles application startup, token initialization, and model discovery

### API Routes

- **chat-completions/**: Handles chat completion endpoints and streaming responses
- **models/**: Manages model-related endpoints

### Services

- **api-instance.ts**: Configures API clients for GitHub and Copilot
- **copilot/**: Contains services for interacting with GitHub Copilot API
  - **chat-completions/**: Chat completion service and types
  - **get-models/**: Model retrieval service and types

### Server Configuration

- **main.ts**: Application entry point and server initialization
- **server.ts**: HTTP server setup with route definitions
