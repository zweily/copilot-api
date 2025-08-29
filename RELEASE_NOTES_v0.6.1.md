# copilot-api v0.6.1 Release Notes

## 🚀 New Features

### SOCKS5 & HTTP Proxy Support
- **Full proxy support** for GitHub API communication
- Support for **SOCKS5**, **HTTP**, and **HTTPS** proxies
- **Command line arguments**: `--proxy-url socks5://127.0.0.1:1080`
- **Environment variables**: `SOCKS5_PROXY`, `HTTP_PROXY`, `HTTPS_PROXY`
- Perfect for users in restricted networks (China, corporate firewalls, etc.)

### Enhanced --claude-code Multi-Platform Support
- **Smart shell detection** for Windows, Linux, and Mac
- **Platform-specific command generation**:
  - **PowerShell**: `$env:VAR = "value"; claude`
  - **Command Prompt**: `set VAR="value" & claude`
  - **Bash/Zsh**: `export VAR='value'; claude`
  - **Fish Shell**: `set -gx VAR 'value'; claude`
- **Automatic clipboard copy** of the detected shell command
- **Show all platform variants** for easy sharing

## 🔧 Improvements
- Proper value quoting and escaping for all shell types
- Better error handling for proxy configuration
- Enhanced user feedback with detected shell information
- Improved command formatting and readability

## 📦 Installation

### NPM (Recommended)
```bash
npm install -g copilot-api@0.6.1
```

### From Source
```bash
git clone https://github.com/zweily/copilot-api.git
cd copilot-api
npm install
npm run build
npm install -g .
```

## 🌐 Usage Examples

### With SOCKS5 Proxy
```bash
# Command line
copilot-api auth --proxy-url socks5://127.0.0.1:1080
copilot-api start --proxy-url socks5://127.0.0.1:1080

# Environment variable
export SOCKS5_PROXY=socks5://127.0.0.1:1080
copilot-api auth
```

### Claude Code Integration
```bash
copilot-api start --claude-code
# Automatically detects your shell and provides appropriate commands
```

## 🐛 Bug Fixes
- Fixed TypeScript compilation issues
- Improved error handling for network requests
- Better proxy agent compatibility

## 📝 Full Changelog
- feat: Add SOCKS5 and HTTP proxy support for GitHub API communication
- feat: enhance --claude-code with improved multi-platform shell detection
- chore: bump version to 0.6.1 and fix TypeScript issues

---

**What's Next?** 
We're working on additional authentication methods and more proxy protocols. Star ⭐ the repo to stay updated!
