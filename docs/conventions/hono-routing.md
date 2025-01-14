# Hono Routing Conventions

## Directory Structure

Routes should follow this structure:

```
routes/
├── feature-name/
│   ├── route.ts       # Route handlers and middleware
│   └── utils.ts       # Helper functions and utilities
```

## Route Organization

1. **File Naming:**

   - Main route file should be named `route.ts`
   - Supporting utilities should be in `utils.ts`
   - Types specific to the route should be in `types.ts`

2. **Route Handler Structure:**

   - Each route handler should be a separate function
   - Use middleware for common functionality across routes
   - Keep route handlers focused on a single responsibility

3. **Response Formatting:**
   - Use utility functions for consistent response formatting
   - Maintain consistent error handling patterns
   - Follow OpenAI API response format for compatibility

## Best Practices

1. **Type Safety:**

   - Use TypeScript types for request/response objects
   - Define interface types for route parameters
   - Leverage Hono's built-in type system

2. **Error Handling:**

   - Use consistent error response format
   - Implement proper error status codes
   - Include meaningful error messages

3. **Middleware:**
   - Use middleware for cross-cutting concerns
   - Keep middleware chain clean and focused
   - Document middleware effects

## Example Structure

```typescript
// route.ts
import { Hono } from "hono";
import { utils } from "./utils";

const route = new Hono();

route.post("/endpoint", async (c) => {
  // Route implementation
});

export default route;
```
