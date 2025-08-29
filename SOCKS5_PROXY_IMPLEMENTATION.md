# SOCKS5 Proxy Support Implementation

This implementation adds SOCKS5 proxy support to the GitHub Copilot API proxy project.

## Features Added

1. **SOCKS5 and HTTP Proxy Support**: The proxy manager supports both SOCKS5 and HTTP proxies
2. **Environment Variable Support**: Automatically detects proxy settings from environment variables
3. **Command Line Arguments**: Added `--proxy-url` argument to both `start` and `auth` commands
4. **Automatic Proxy Detection**: Falls back to environment variables if no proxy URL is provided

## New Files

- `src/lib/proxy-config.ts`: Proxy configuration manager and URL parser
- `src/lib/proxy-fetch.ts`: Custom fetch wrapper that applies proxy settings

## Modified Files

- `src/start.ts`: Added proxy support to start command
- `src/auth.ts`: Added proxy support to auth command
- All GitHub service files: Updated to use `proxyFetch` instead of `fetch`
- `src/services/get-vscode-version.ts`: Updated to use proxy fetch

## Usage Examples

### Using Command Line Arguments

```bash
# SOCKS5 proxy
copilot-api auth --proxy-url socks5://127.0.0.1:1080
copilot-api start --proxy-url socks5://127.0.0.1:1080

# SOCKS5 with authentication
copilot-api auth --proxy-url socks5://username:password@127.0.0.1:1080
copilot-api start --proxy-url socks5://username:password@127.0.0.1:1080

# HTTP proxy
copilot-api auth --proxy-url http://127.0.0.1:8080
copilot-api start --proxy-url http://127.0.0.1:8080
```

### Using Environment Variables

```bash
# SOCKS5 proxy
export SOCKS5_PROXY=socks5://127.0.0.1:1080
copilot-api auth
copilot-api start

# HTTP proxy
export HTTP_PROXY=http://127.0.0.1:8080
copilot-api auth
copilot-api start
```

## Supported Environment Variables

- `SOCKS5_PROXY` or `socks5_proxy`: SOCKS5 proxy URL (highest priority)
- `HTTP_PROXY` or `http_proxy`: HTTP proxy URL
- `HTTPS_PROXY` or `https_proxy`: HTTPS proxy URL

## Dependencies Added

- `proxy-agent`: Universal proxy agent supporting HTTP, HTTPS, and SOCKS5 proxies
- `node-fetch@2`: HTTP client with proper proxy agent support
- `@types/node-fetch`: TypeScript definitions for node-fetch

## Technical Implementation

### Proxy Manager

- Singleton pattern to manage proxy configuration across the application
- Parses proxy URLs and creates appropriate proxy agents
- Sets up global proxy configuration via environment variables

### Custom Fetch

- `proxyFetch` function using `node-fetch` with proxy agent support
- Automatic proxy agent injection for all network requests
- Fallback to regular fetch when no proxy is configured

### URL Parsing

- Robust URL parsing to extract proxy type, host, port, and authentication
- Support for both explicit proxy URLs and environment variable detection

## How It Works

1. **Proxy Configuration**: Command line arguments or environment variables are parsed into a `ProxyConfig`
2. **Agent Creation**: `proxy-agent` library creates the appropriate proxy agent (SOCKS5, HTTP, etc.)
3. **Request Routing**: All GitHub API calls use `proxyFetch` which applies the proxy agent to `node-fetch`
4. **Global Setup**: Environment variables are also set for broader Node.js compatibility

## Testing

The implementation has been successfully tested with:

- ✅ SOCKS5 proxy authentication flow
- ✅ GitHub API token acquisition through SOCKS5 proxy
- ✅ Command line proxy URL configuration
- ✅ Environment variable proxy detection

This ensures all GitHub API communication properly routes through the configured SOCKS5 proxy.
