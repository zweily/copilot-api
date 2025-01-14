# Service Layer Conventions

## Directory Structure

Services should follow this structure:

```
services/
├── api-instance.ts              # API client configurations
└── feature-name/
    ├── service.ts              # Main service implementation
    └── types.ts               # Core types
```

## API Client Configuration

1. **Instance Creation:**

   - Use `ofetch.create()` for API clients
   - Configure base URLs and common headers
   - Implement request/response interceptors
   - Handle authentication tokens

2. **Error Handling:**
   - Implement `onRequestError` handlers
   - Implement `onResponseError` handlers
   - Use proper error logging with `consola`

## Type Organization

1. **Core Types:**

   - Place main interface definitions in `types.ts`
   - Group related types together
   - Use explicit type exports

2. **Specialized Types:**
   - Separate streaming types into `types.streaming.ts`
   - Keep response/request types close to their usage
   - Document complex type relationships

## Service Implementation

1. **Service Structure:**

   - One primary service per feature
   - Keep services focused and single-purpose
   - Export clear public interfaces

2. **Methods:**
   - Use async/await for API calls
   - Implement proper error handling
   - Return strongly typed responses

## Best Practices

1. **Type Safety:**

   - Use TypeScript interfaces for API responses
   - Define explicit return types
   - Avoid using `any`

2. **Authentication:**

   - Handle token management consistently
   - Implement token refresh logic
   - Use secure token storage

3. **Error Management:**
   - Define specific error types
   - Provide meaningful error messages
   - Log errors appropriately
