import { Hono } from "hono"
import { cors } from "hono/cors"
import { logger } from "hono/logger"

import { addAuthInfoMiddleware, authMiddleware } from "./lib/auth-middleware"
import { completionRoutes } from "./routes/chat-completions/route"
import { embeddingRoutes } from "./routes/embeddings/route"
import { messageRoutes } from "./routes/messages/route"
import { modelRoutes } from "./routes/models/route"
import { tokenRoute } from "./routes/token/route"
import { usageRoute } from "./routes/usage/route"

export const server = new Hono()

server.use(logger())
server.use(cors())
server.use(addAuthInfoMiddleware)

// Health check endpoint (unprotected)
server.get("/", (c) => c.text("Server running"))
server.get("/health", (c) =>
  c.json({ status: "ok", timestamp: new Date().toISOString() }),
)

// Protected API endpoints
server.use("/chat/completions/*", authMiddleware)
server.use("/v1/chat/completions/*", authMiddleware)
server.use("/models/*", authMiddleware)
server.use("/v1/models/*", authMiddleware)
server.use("/embeddings/*", authMiddleware)
server.use("/v1/embeddings/*", authMiddleware)
server.use("/v1/messages/*", authMiddleware)
server.use("/token/*", authMiddleware)

server.route("/chat/completions", completionRoutes)
server.route("/models", modelRoutes)
server.route("/embeddings", embeddingRoutes)
server.route("/usage", usageRoute)
server.route("/token", tokenRoute)

// Compatibility with tools that expect v1/ prefix
server.route("/v1/chat/completions", completionRoutes)
server.route("/v1/models", modelRoutes)
server.route("/v1/embeddings", embeddingRoutes)

// Anthropic compatible endpoints
server.route("/v1/messages", messageRoutes)
server.post("/v1/messages/count_tokens", (c) => c.json({ input_tokens: 1 }))
