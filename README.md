# Copilot API

⚠️ **EDUCATIONAL PURPOSE ONLY** ⚠️
This project is a reverse-engineered implementation of the GitHub Copilot API created for educational purposes only. It is not officially supported by GitHub and should not be used in production environments.

## Project Overview

A wrapper around GitHub Copilot API to make it OpenAI compatible, making it usable for other tools.

**Note:** Image/vision capabilities are not supported as GitHub Copilot's API does not support image input.

## Prerequisites

- Bun (version 1.0.0 or higher)
- GitHub account with Copilot Individual subscription

## Installation

To install dependencies, run:

```sh
bun install
```

## Using with npx

You can run the project directly using npx:

```sh
npx copilot-api
```

With options:

```sh
npx copilot-api --port 8080 --emulate-streaming
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

Runs the server in production mode with optimizations enabled and hot reloading disabled. Use this for deployment or production environments.

### Command Line Options

The server accepts several command line options:

| Option              | Description                                                    | Default |
| ------------------- | -------------------------------------------------------------- | ------- |
| --help, -h          | Show help message                                              | false   |
| --emulate-streaming | Enable streaming response emulation                            | false   |
| --port, -p          | Port to listen on                                              | 4141    |
| --logs              | Write logs to the app directory (requires --emulate-streaming) | false   |

Example with options:

```sh
bun run start --port 8080 --emulate-streaming
```

In all cases, the server will start and listen for API requests on the specified port.

## Tested Tools Compatibility

The following AI tools have been tested with this API:

### [Cline](https://github.com/cline/cline)

- Works with GPT-4o
- Not compatible with Claude 3.5 Sonnet (Cline prompts are too long)

### [Aider](https://github.com/Aider-AI/aider)

- Fully compatible

### [bolt.diy](https://github.com/stackblitz-labs/bolt.diy)

- Sometimes models fail to load - you can set any random API key in the UI to refresh the models list

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the [GNU General Public License v3.0](LICENSE).
