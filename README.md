# Copilot API

> [!WARNING]
> This is a reverse-engineered and unofficial implementation of the GitHub Copilot API. It is not supported by GitHub, and may break unexpectedly. Use at your own risk.

[![ko-fi](https://ko-fi.com/img/githubbutton_sm.svg)](https://ko-fi.com/E1E519XS7W)

## Project Overview

A wrapper around GitHub Copilot API to make it OpenAI compatible, making it usable for other tools like AI assistants, local interfaces, and development utilities.

## Demo

https://github.com/user-attachments/assets/7654b383-669d-4eb9-b23c-06d7aefee8c5

## Prerequisites

- Bun (>= 1.2.x)
- GitHub account with Copilot subscription (Individual or Business)

## Installation

To install dependencies, run:

```sh
bun install
```

## Using with Docker

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
npx copilot-api@latest start
```

With options:

```sh
npx copilot-api@latest start --port 8080
```

For authentication only:

```sh
npx copilot-api@latest auth
```

## Command Structure

Copilot API now uses a subcommand structure with two main commands:

- `start`: Start the Copilot API server (default command). This command will also handle authentication if needed.
- `auth`: Run GitHub authentication flow without starting the server. This is typically used if you need to generate a token for use with the `--github-token` option, especially in non-interactive environments.

## Command Line Options

### Start Command Options

The following command line options are available for the `start` command:

| Option         | Description                                                                   | Default | Alias |
| -------------- | ----------------------------------------------------------------------------- | ------- | ----- |
| --port         | Port to listen on                                                             | 4141    | -p    |
| --verbose      | Enable verbose logging                                                        | false   | -v    |
| --account-type | Account type to use (individual, business, enterprise)                        | individual | -a    |
| --manual       | Enable manual request approval                                                | false   | none  |
| --rate-limit   | Rate limit in seconds between requests                                        | none    | -r    |
| --wait         | Wait instead of error when rate limit is hit                                  | false   | -w    |
| --github-token | Provide GitHub token directly (must be generated using the `auth` subcommand) | none    | -g    |

### Auth Command Options

| Option    | Description            | Default | Alias |
| --------- | ---------------------- | ------- | ----- |
| --verbose | Enable verbose logging | false   | -v    |

## Example Usage

Using with npx:

```sh
# Basic usage with start command
npx copilot-api@latest start

# Run on custom port with verbose logging
npx copilot-api@latest start --port 8080 --verbose

# Use with a business plan GitHub account
npx copilot-api@latest start --account-type business

# Use with an enterprise plan GitHub account
npx copilot-api@latest start --account-type enterprise

# Enable manual approval for each request
npx copilot-api@latest start --manual

# Set rate limit to 30 seconds between requests
npx copilot-api@latest start --rate-limit 30

# Wait instead of error when rate limit is hit
npx copilot-api@latest start --rate-limit 30 --wait

# Provide GitHub token directly
npx copilot-api@latest start --github-token ghp_YOUR_TOKEN_HERE

# Run only the auth flow
npx copilot-api@latest auth

# Run auth flow with verbose logging
npx copilot-api@latest auth --verbose
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

- Consider using free models (e.g., Gemini, Mistral, Openrouter) as the `weak-model`
- Use architect mode sparingly
- Disable `yes-always` in your aider configuration
- Enable the `--manual` flag to review and approve each request before processing
- If you have a GitHub business or enterprise plan account with Copilot, use the `--account-type` flag (e.g., `--account-type business`). See the [official documentation](https://docs.github.com/en/enterprise-cloud@latest/copilot/managing-copilot/managing-github-copilot-in-your-organization/managing-access-to-github-copilot-in-your-organization/managing-github-copilot-access-to-your-organizations-network#configuring-copilot-subscription-based-network-routing-for-your-enterprise-or-organization) for more details.

### Manual Request Approval

When using the `--manual` flag, the server will prompt you to approve each incoming request:

```
? Accept incoming request? > (y/N)
```

This helps you control usage and monitor requests in real-time.
