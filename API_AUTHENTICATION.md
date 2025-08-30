# API Authentication Implementation

This document describes the API key authentication system implemented in copilot-api v0.6.2.

## Overview

The API authentication system protects the copilot-api server from unauthorized access using API keys. This is crucial for production deployments where the server might be exposed to the internet.

## Features

- **Secure API Key Storage**: Keys are hashed using SHA-256 before storage
- **Multiple Authentication Methods**: 
  - `Authorization: Bearer <key>` header
  - `X-API-Key: <key>` header
- **File-based or Command-line Configuration**: Keys can be managed via CLI or provided directly
- **Optional Authentication**: Can be disabled for local development
- **Multiple Keys Support**: Support multiple API keys for different users/applications
- **Automatic Key Generation**: Built-in secure key generator

## Security Features

- API keys are hashed before storage (not stored in plaintext)
- File permissions set to 0o600 (owner read/write only)
- Masked key logging for security
- Request source IP logging for security monitoring

## Implementation Details

### Files Added

- `src/lib/api-auth.ts`: Core API key management functionality
- `src/lib/auth-middleware.ts`: Hono middleware for authentication
- `src/api-keys.ts`: CLI command for managing API keys

### Files Modified

- `src/server.ts`: Added authentication middleware to protected routes
- `src/start.ts`: Added API key configuration options
- `src/main.ts`: Added api-keys command

## API Key Format

Generated API keys follow the format: `capi_<64_hex_characters>`

Example: `capi_a1b2c3d4e5f6789012345678901234567890abcdef1234567890abcdef123456`

## Usage Examples

### Generate and Configure API Keys

```bash
# Generate a new API key
copilot-api api-keys generate

# List existing keys (masked for security)
copilot-api api-keys list

# Add a custom API key
copilot-api api-keys add --key your-custom-key

# Remove an API key
copilot-api api-keys remove --key capi_abc123...

# Enable authentication
copilot-api api-keys enable

# Disable authentication
copilot-api api-keys disable
```

### Start Server with Authentication

```bash
# Start with file-based keys (default)
copilot-api start

# Start with command-line provided keys
copilot-api start --api-keys "key1,key2,key3"

# Disable authentication for local development
copilot-api start --disable-auth
```

### Making Authenticated Requests

```bash
# Using Authorization header
curl -H "Authorization: Bearer capi_your_key_here" \
     http://localhost:4141/v1/models

# Using X-API-Key header
curl -H "X-API-Key: capi_your_key_here" \
     http://localhost:4141/v1/chat/completions \
     -d '{"model":"gpt-4","messages":[{"role":"user","content":"Hello"}]}'
```

## Protected Endpoints

The following endpoints require authentication when enabled:

- `/chat/completions/*`
- `/v1/chat/completions/*`
- `/models/*` 
- `/v1/models/*`
- `/embeddings/*`
- `/v1/embeddings/*`
- `/v1/messages/*`
- `/token/*`

## Unprotected Endpoints

The following endpoints are always accessible:

- `/` - Server status
- `/health` - Health check
- `/usage/*` - Usage statistics (read-only)

## Configuration Storage

API keys are stored in: `~/.local/share/copilot-api/api_keys.json`

Format:
```json
{
  "keys": ["capi_key1", "capi_key2"],
  "enabled": true
}
```

## Error Responses

When authentication fails, the server returns:

```json
{
  "error": {
    "message": "API key required. Provide it via 'Authorization: Bearer <key>' or 'X-API-Key: <key>' header.",
    "type": "authentication_error"
  }
}
```

Status Code: `401 Unauthorized`

## Development vs Production

### Development Mode
```bash
# No authentication needed
copilot-api start --disable-auth
```

### Production Mode
```bash
# First, generate an API key
copilot-api api-keys generate

# Start with authentication enabled
copilot-api start
```

## Migration from Previous Versions

Existing installations will work without modification:
- Authentication is disabled by default if no keys are configured
- A warning is shown suggesting to set up API keys for security

## Security Considerations

1. **API Key Security**: Store API keys securely and rotate them regularly
2. **HTTPS**: Always use HTTPS in production to protect keys in transit
3. **Key Rotation**: Regularly rotate API keys for better security
4. **Monitoring**: Monitor authentication logs for suspicious activity
5. **Principle of Least Privilege**: Use different keys for different applications/users

## Environment Variable Support

You can also configure API keys via environment variables:

```bash
export COPILOT_API_KEYS="key1,key2,key3"
export COPILOT_API_DISABLE_AUTH="false"
copilot-api start
```
