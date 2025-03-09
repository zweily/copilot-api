# Copilot API

⚠️ **EDUCATIONAL PURPOSE ONLY** ⚠️
This project is a reverse-engineered implementation of the GitHub Copilot API created for educational purposes only. It is not officially supported by GitHub and should not be used in production environments.

## Project Overview

A wrapper around GitHub Copilot API to make it OpenAI compatible, making it usable for other tools.

## Demo

https://github.com/user-attachments/assets/7654b383-669d-4eb9-b23c-06d7aefee8c5

## Prerequisites

- Bun (>= 1.2.x)
- GitHub account with Copilot Individual subscription

## Installation

To install dependencies, run:

```sh
bun install
```

## Using with npx

You can run the project directly using npx:

```sh
npx copilot-api@latest
```

With options:

```sh
npx copilot-api --port 8080
```

## Running from Source

The project can be run from source in several ways:

### Development Mode

```sh
bun run dev
```

Starts the server with hot reloading enabled, which automatically restarts the server when code changes are detected. This is ideal for development.

### Production Mode

```sh
bun run start
```

Runs the server in production mode with hot reloading disabled. Use this for deployment or production environments.

### Command Line Options

The server accepts several command line options:

| Option        | Description                          | Default |
| ------------- | ------------------------------------ | ------- |
| --port, -p    | Port to listen on                    | 4141    |
| --verbose, -v | Enable verbose logging               | false   |
| --log-file    | File to log request/response details | -       |

Note: The `--help, -h` option is automatically available through the underlying command-line framework.

Example with options:

```sh
bun run start --port 8080 --verbose
```

In all cases, the server will start and listen for API requests on the specified port.

## Tested Tools Compatibility

| Tool                                                             | Status | Notes                                                                 |
| ---------------------------------------------------------------- | ------ | --------------------------------------------------------------------- |
| [Aider](https://github.com/Aider-AI/aider)                       | Full   | Fully compatible                                                      |
| [bolt.diy](https://github.com/stackblitz-labs/bolt.diy)          | Full   | Fully compatible; use any random API key in UI if models fail to load |
| [Page Assist](https://github.com/n4ze3m/page-assist)             | Full   | Fully compatible                                                      |
| [Kobold AI Lite](https://github.com/LostRuins/lite.koboldai.net) | Full   | Fully compatible                                                      |

**Note:** In general, any application that uses the standard OpenAI-compatible `/chat/completions` and `/models` endpoints should work with this API.
