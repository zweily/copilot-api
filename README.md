# Copilot API

⚠️ **EDUCATIONAL PURPOSE ONLY** ⚠️
This project is a reverse-engineered implementation of the GitHub Copilot API created for educational purposes only. It is not officially supported by GitHub and should not be used in production environments.

## Project Overview

A wrapper around GitHub Copilot API to make it OpenAI compatible, making it usable for other tools.

## Prerequisites

- Bun (version 1.0.0 or higher)
- GitHub account with Copilot access

## Installation

To install dependencies, run:

```sh
bun install
```

## Running the Project

To run the project:

```sh
bun run dev
```

The server will start and listen for API requests.

## Tested Tools Compatibility

The following AI tools have been tested with this API:

### Cline
- Works with GPT-4o
- Not compatible with Claude 3.5 Sonnet (prompts too long)

### Aider
- Works with GPT-4o
- Works with Claude 3.5 Sonnet

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
