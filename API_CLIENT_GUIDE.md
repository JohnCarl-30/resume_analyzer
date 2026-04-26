# API Client Guide

This guide explains how to use the new robust API client with timeout, retry logic, and error handling.

## Overview

The new API client (`lib/api-client.ts`) provides:
- ⏱️ **Timeout Protection**: Prevents hanging requests (default 30s)
- 🔄 **Automatic Retries**: Retries failed GET requests up to 3 times with exponential backoff
- ❌ **Better Error Handling**: Structured error parsing with field/form error support
- 🔍 **Debug Mode**: Optional logging for development
- 🛡️ **Type Safety**: Full TypeScript support

## Usage

### Basic Usage

The API client is already integrated into all API calls. Most code doesn't need to change.

**Before (Old Way):**
```typescript
const response = await fetch(buildApiUrl("/api/analysis"), {
  method: "GET",
});
const payload = (await response.json()) as ApiEnvelope<ResumeAnalysisResult[]>;
if (!response.ok || !payload?.data) {
  throw new Error("Unable to load analyses");
}
return payload.data;
```

**After (New Way):**
```typescript
import { apiClient } from "lib/api-instance";

return await apiClient.get<ResumeAnalysisResult[]>("/api/analysis");
```

### Creating API Functions

```typescript
import { apiClient } from "../../../lib/api-instance";
import type { ApiError } from "../../../lib/api-client";

// GET request (auto-retry on failure)
export async function getAnalysis(id: string) {
  try {
    return await apiClient.get<AnalysisResult>(`/api/analysis/${id}`);
  } catch (error) {
    throw new Error(error instanceof Error ? error.message : "Failed");
  }
}

// POST request (FormData support)
export async function uploadResume(formData: FormData) {
  try {
    return await apiClient.post<AnalysisResult>("/api/upload", formData, true);
  } catch (error) {
    // Handle error
  }
}

// PATCH request (JSON body)
export async function updateAnalysis(id: string, data: any) {
  return await apiClient.patch<AnalysisResult>(`/api/analysis/${id}`, data);
}

// DELETE request
export async function deleteAnalysis(id: string) {
  return await apiClient.delete<void>(`/api/analysis/${id}`);
}
```

### Error Handling

The API client throws `ApiError` which includes structured error information:

```typescript
import type { ApiError } from "lib/api-client";

try {
  await apiClient.get("/api/data");
} catch (error) {
  if (error instanceof Error && "fieldErrors" in error) {
    const apiError = error as ApiError;
    console.log("Status:", apiError.statusCode);
    console.log("Field errors:", apiError.fieldErrors);
    console.log("Form errors:", apiError.formErrors);
  }
}
```

### Field-Level Error Handling

When the server returns validation errors, they're structured by field:

```typescript
try {
  await apiClient.post("/api/analysis/upload", formData, true);
} catch (error) {
  if (error instanceof Error && "fieldErrors" in error) {
    const apiError = error as ApiError;
    
    if (apiError.fieldErrors?.jobDescription) {
      // Handle job description error
      setJobDescriptionError(apiError.fieldErrors.jobDescription[0]);
    }
    
    if (apiError.fieldErrors?.resumeText) {
      // Handle resume text error
      setResumeError(apiError.fieldErrors.resumeText[0]);
    }
  }
}
```

## Configuration

The API client is pre-configured in `lib/api-instance.ts`:

```typescript
import { createApiClient } from "./api-client";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:4000";

export const apiClient = createApiClient({
  baseUrl: API_BASE_URL,
  timeout: 30_000,        // 30 second timeout
  maxRetries: 3,          // Retry up to 3 times
  debug: process.env.NODE_ENV === "development",
});
```

### Custom Configuration

To create an API client with different settings:

```typescript
import { createApiClient } from "lib/api-client";

const customClient = createApiClient({
  baseUrl: "https://api.example.com",
  timeout: 60_000,  // 60 seconds
  maxRetries: 5,    // 5 retries
  debug: true,      // Enable logging
});

const data = await customClient.get("/data");
```

## Retry Behavior

### How Retries Work

- **Only GET requests are retried** (safe operations)
- **Retried on**: Network errors and 5xx server errors
- **Not retried on**: 4xx errors (client errors are permanent)
- **Backoff strategy**: Exponential backoff
  - Attempt 1: Immediate
  - Attempt 2: Wait 1 second, then retry
  - Attempt 3: Wait 2 seconds, then retry
  - Attempt 4: Wait 4 seconds, then retry

### Example Flow

```
GET /api/analysis          → Network error
Wait 1 second
GET /api/analysis          → 502 Bad Gateway
Wait 2 seconds
GET /api/analysis          → Success ✓
```

## Timeout Behavior

All requests have a 30-second timeout by default:

```
Request starts at 0:00
... (request in progress)
30 seconds pass
Request is aborted
Error: "Request timeout after 30000ms"
```

This prevents the app from hanging indefinitely on slow/broken connections.

## Debug Mode

Enable debug logging by setting environment variable or directly:

```typescript
const debugClient = createApiClient({
  baseUrl: "http://localhost:4000",
  debug: true,
});
```

Console output:
```
[API] GET /api/analysis
[API] Success: GET /api/analysis {data: [...]}
[API] Retrying request (attempt 2/3) after 1000ms
```

## Type Safety

All requests are fully typed:

```typescript
interface UserData {
  id: string;
  name: string;
}

// TypeScript knows the return type
const user = await apiClient.get<UserData>("/api/user/123");
console.log(user.id); // ✓ TypeScript knows 'id' exists
console.log(user.email); // ✗ TypeScript error: no 'email' property
```

## Migration Guide

If you have existing API calls using raw `fetch()`, here's how to migrate:

### Old Code
```typescript
const response = await fetch(buildApiUrl("/api/data"));
const payload = await response.json();
if (!response.ok) {
  throw new Error("Failed to load data");
}
return payload.data;
```

### New Code
```typescript
import { apiClient } from "lib/api-instance";

return await apiClient.get("/api/data");
```

That's it! The error handling, retry logic, and timeout are all built-in.

## Common Patterns

### Retry Button in UI
```typescript
const [error, setError] = useState("");
const [isLoading, setIsLoading] = useState(false);

async function loadData() {
  setIsLoading(true);
  setError("");
  try {
    const data = await apiClient.get("/api/data");
    // use data
  } catch (error) {
    setError(error instanceof Error ? error.message : "Failed");
  } finally {
    setIsLoading(false);
  }
}

return (
  <>
    {error && (
      <div>
        {error}
        <button onClick={loadData}>Retry</button>
      </div>
    )}
    <button onClick={loadData} disabled={isLoading}>
      {isLoading ? "Loading..." : "Load"}
    </button>
  </>
);
```

### Form Submission with Field Errors
```typescript
async function handleSubmit(formData) {
  try {
    const result = await apiClient.post("/api/submit", formData);
    onSuccess(result);
  } catch (error) {
    if (error instanceof Error && "fieldErrors" in error) {
      const apiError = error as ApiError;
      setFieldErrors(apiError.fieldErrors);
    } else {
      setGeneralError(error instanceof Error ? error.message : "Failed");
    }
  }
}
```

## TypeScript Types Reference

### ApiError
```typescript
class ApiError extends Error {
  statusCode?: number;
  fieldErrors?: Record<string, string[]>;
  formErrors?: string[];
}
```

### ApiEnvelope
```typescript
interface ApiEnvelope<T> {
  data: T;
  error?: string;
  details?: {
    formErrors?: string[];
    fieldErrors?: Record<string, string[]>;
  };
}
```

### ApiClientConfig
```typescript
interface ApiClientConfig {
  baseUrl: string;
  timeout?: number;        // milliseconds (default: 30000)
  maxRetries?: number;     // retries for GET only (default: 3)
  debug?: boolean;         // enable logging (default: false)
}
```

## Best Practices

1. **Always handle errors**: Catch and display errors to users
2. **Show loading state**: Indicate to users when requests are in progress
3. **Use field errors**: Display validation errors near relevant form fields
4. **Provide retry**: Let users retry failed requests manually
5. **Test error paths**: Make sure error UI is tested and works
6. **Use TypeScript**: Always specify generic types for requests

## Troubleshooting

### "Request timeout after 30000ms"
- **Cause**: Server took longer than 30 seconds to respond
- **Solution**: Check server health, network latency, or increase timeout in `api-instance.ts`

### Retries not happening
- **Cause**: Only GET requests are retried; POST/PATCH/DELETE are not
- **Solution**: For critical mutations, implement your own retry button in UI

### Field errors not shown
- **Cause**: Error structure doesn't match expected format
- **Solution**: Check server response format matches `ApiEnvelope` interface

### Type errors on response
- **Cause**: Generic type doesn't match actual response structure
- **Solution**: Verify the `<ResponseType>` matches what the API actually returns

## See Also

- `lib/api-client.ts` - Implementation
- `lib/api-instance.ts` - Singleton instance
- `features/onboarding/utils/analysis-api.ts` - Usage example
