# Command Line Interface

The Copilot API provides a command-line interface with various configuration options.

## Usage

```bash
copilot-api [options]
```

## Options

| Option      | Alias | Description                                     | Default |
|-------------|-------|-------------------------------------------------|---------|
| --help      | -h    | Show help message                               | false   |
| --stream    | -s    | Enable streaming response for chat completions   | true   |
| --no-stream |       | Disable streaming response                       |         |
| --port      | -p    | Port to listen on                               | 4141    |

## Examples

Start server on default port:
```bash
copilot-api
```

Start server with streaming enabled:
```bash
copilot-api --stream
```

Start server on custom port:
```bash
copilot-api --port 8080
```

Show help message:
```bash
copilot-api --help
```
