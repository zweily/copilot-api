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

## Command Line Options

The command accepts several command line options:

| Option        | Description                          | Default |
| ------------- | ------------------------------------ | ------- |
| --port, -p    | Port to listen on                    | 4141    |
| --verbose, -v | Enable verbose logging               | false   |
| --log-file    | File to log request/response details | -       |

Example with options:

```sh
npx copilot-api@latest --port 8080 --verbose --log-file copilot-api.txt
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

## Tips to not hit the rate limit

- Use a free model from free provider like Gemini/Mistral/Openrouter for the weak model
- Rarely use architect mode
- Do not enable automatic yes in aider config
- Claude 3.7 thinking mode uses more tokens. Use it sparingly

## Roadmap

- Manual approval for every request
- Rate limiting (only allow request every X seconds)
- Token counting
