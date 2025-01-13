# Project Name

## Project Overview
A brief description of the project and its purpose.

## Prerequisites
- Node.js (version X.X.X or higher)
- Bun (version X.X.X or higher)

## Installation
To install dependencies, run:
```sh
bun install
```

## Running the Project
To run the project, execute:
```sh
bun run dev
```
Then open [http://localhost:3000](http://localhost:3000) in your browser.

## Directory Structure
```
/home/erick/Documents/sides/copilot-api
├── .gitignore
├── bun.lockb
├── eslint.config.js
├── package.json
├── payload.json
├── README.md
├── response.json
├── tsconfig.json
├── src/
│   ├── main.ts
│   ├── server.ts
│   ├── lib/
│   │   ├── cache.ts
│   │   ├── env.ts
│   │   ├── paths.ts
│   │   └── tokens.ts
│   ├── routes/
│   │   └── chat-completions/
│   │       └── route.ts
│   ├── services/
│   │   ├── copilot-vscode/
│   │   │   ├── api-instance.ts
│   │   │   ├── chat-completions/
│   │   │   │   ├── service.ts
│   │   │   │   ├── types.streaming.ts
│   │   │   │   └── types.ts
│   │   │   ├── get-models/
│   │   │   │   ├── service.ts
│   │   │   │   └── types.ts
│   │   │   ├── get-token/
│   │   │   │   ├── copilot-token.ts
│   │   │   │   ├── github-token.ts
│   │   │   │   └── types.ts
│   │   ├── copilot-web/
│   │   │   ├── api-instance.ts
│   │   │   ├── create-message/
│   │   │   │   ├── service.ts
│   │   │   │   └── types.ts
│   │   │   ├── create-thread/
│   │   │   │   ├── service.ts
│   │   │   │   └── types.ts
```

## Contributing
Guidelines for contributing to the project.

## License
Information about the project's license.
