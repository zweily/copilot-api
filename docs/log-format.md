# Request Logging Format

This document describes the format used for logging API requests and responses.

## Format Structure

Each log entry follows this format:

```
=== YYYY-MM-DD HH:MM:SS UTC ===
REQUEST:
POST /v1/chat/completions
{
  "model": "gpt-4",
  "messages": [
    {"role": "system", "content": "You are a helpful assistant"},
    {"role": "user", "content": "Hello!"}
  ]
}

RESPONSE:
{
  "id": "chatcmpl-124",
  "choices": [{
    "message": {
      "role": "assistant", 
      "content": "Hi! How can I help you today?"
    }
  }],
  "usage": {
    "total_tokens": 42
  }
}

-------------------
```

## Components

1. **Timestamp Header**
   - UTC timestamp in format: YYYY-MM-DD HH:MM:SS UTC
   - Enclosed in === markers

2. **Request Section**
   - Starts with "REQUEST:"
   - Includes HTTP method and endpoint
   - Full request payload in JSON format

3. **Response Section**
   - Starts with "RESPONSE:"
   - Full response payload in JSON format
   - Includes completion ID, choices, and usage statistics

4. **Entry Separator**
   - A line of dashes separates each log entry
   - Makes logs easier to read and parse

## Location

Log files are stored in the application's configured log directory with daily rotation.
