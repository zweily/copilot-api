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

## Using with docker

Build image

```sh
docker build -t copilot-api .
```

Run the container

```sh
docker run -p 4141:4141 copilot-api
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

## Command Line Options

The following command line options are available:

| Option        | Description            | Default |
| ------------- | ---------------------- | ------- |
| --port, -p    | Port to listen on      | 4141    |
| --verbose, -v | Enable verbose logging | false   |

Example usage:

```sh
npx copilot-api@latest --port 8080 --verbose
```

## Running from Source

The project can be run from source in several ways:

### Development Mode

```sh
bun run dev
```

### Production Mode

```sh
bun run start
```

## Usage Tips

To avoid rate limiting and optimize your experience:

- Consider using free models (e.g., Gemini, Mistral, Openrouter) as the `weak-model`
- Use architect mode sparingly
- Disable `yes-always` in your aider configuration
- Be mindful that Claude 3.7 thinking mode consume more tokens

## Roadmap

- [ ] Manual authentication flow
- [ ] Manual request approval system
- [ ] Rate limiting implementation
- [ ] Token usage tracking and monitoring
- [ ] Enhanced error handling and recovery
