# Command Line Interface

The Copilot API provides a command-line interface powered by `citty`.

## Name and Description

```
Name: copilot-api
Description: A wrapper around GitHub Copilot API to make it OpenAI compatible, making it usable for other tools.
```

## Options

| Option              | Description                                      | Type      | Default |
|--------------------|--------------------------------------------------|-----------|---------|
| --help, -h         | Display help information                         | boolean   | false   |
| --emulate-streaming| Emulate streaming response for chat completions   | boolean   | false   |
| --port, -p         | Port number to listen on                         | string    | "4141"  |

## Environment Variables

The following environment variables are required:

- `GITHUB_CLIENT_ID`: GitHub OAuth client ID
- `GITHUB_OAUTH_SCOPES`: Required OAuth scopes for GitHub

Optional environment variables:
- `EMULATE_STREAMING`: Alternative way to enable streaming emulation

## Examples

Start server with default settings:
```bash
bun run start
```

Start with streaming emulation:
```bash
bun run start --emulate-streaming
```

Start on a custom port:
```bash
bun run start --port 8080
```

Display help:
```bash
bun run start --help
```

## Development Mode

Run in development mode with hot reloading:
```bash
bun run dev
```

## Notes

- The server will print available models on startup
- Authentication tokens are automatically refreshed (every 8 hours for GitHub token)
- Streaming emulation can be enabled via CLI flag or environment variable
