# Application Architecture

## Overview

This application acts as a proxy between users and GitHub Copilot's internal API, presenting an OpenAI-compatible interface. It enables access to Copilot's capabilities by emulating VSCode's authentication flow.

## Authentication Flow

1. **VSCode Emulation**
   - The application mimics VSCode's OAuth flow to obtain valid Copilot access tokens
   - This is necessary because GitHub currently only allows Copilot API access through VSCode-granted tokens

## Core Components

1. **Command Line Interface**
   - Configurable startup options via CLI flags
   - Streaming enabled by default with --no-stream option
   - Custom port configuration via --port flag
   - Built-in help system with -h/--help

2. **Configuration Layer**
   - Centralized API endpoint configurations
   - Environment and OAuth settings
   - File system paths management 
   - Token handling for authentication

2. **API Proxy Layer**
   - Translates requests between OpenAI-compatible format and Copilot's internal API format
   - Handles authentication and token management
   - Manages API rate limits and error handling

2. **API Compatibility**
   - Provides an OpenAI-compatible REST API interface
   - Converts Copilot's responses to match OpenAI's response format
   - Maintains compatibility with standard OpenAI client libraries
