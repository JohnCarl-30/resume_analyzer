/**
 * Centralized API client with timeout, retry logic, and standardized error handling
 */

export interface ApiEnvelope<T> {
  data: T;
  error?: string;
  details?: {
    formErrors?: string[];
    fieldErrors?: Record<string, string[] | undefined>;
  };
}

export class ApiError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public fieldErrors?: Record<string, string[]>,
    public formErrors?: string[],
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export interface ApiClientConfig {
  baseUrl: string;
  timeout?: number;
  maxRetries?: number;
  debug?: boolean;
}

const DEFAULT_TIMEOUT_MS = 30_000;
const DEFAULT_MAX_RETRIES = 3;
const RETRY_DELAY_MS = 1_000;

/**
 * Creates an API client with retry logic, timeout support, and error handling
 */
export function createApiClient(config: ApiClientConfig) {
  const {
    baseUrl,
    timeout = DEFAULT_TIMEOUT_MS,
    maxRetries = DEFAULT_MAX_RETRIES,
    debug = false,
  } = config;

  function log(message: string, data?: unknown) {
    if (debug) {
      console.log(`[API] ${message}`, data ?? "");
    }
  }

  /**
   * Execute fetch with timeout using AbortController
   */
  async function fetchWithTimeout(
    url: string,
    options: RequestInit = {},
  ): Promise<Response> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
      });
      return response;
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") {
        throw new Error(`Request timeout after ${timeout}ms`);
      }
      throw error;
    } finally {
      clearTimeout(timeoutId);
    }
  }

  /**
   * Determine if a request is safe to retry (GET requests only)
   */
  function isSafeToRetry(method: string = "GET"): boolean {
    return method.toUpperCase() === "GET";
  }

  /**
   * Calculate exponential backoff delay
   */
  function getRetryDelay(attempt: number): number {
    return RETRY_DELAY_MS * Math.pow(2, attempt);
  }

  /**
   * Check if response status code is retryable (5xx or network error)
   */
  function isRetryableStatus(status: number): boolean {
    return status >= 500;
  }

  /**
   * Parse error response with field/form error details
   */
  async function parseErrorResponse(
    response: Response,
  ): Promise<{ message: string; fieldErrors?: Record<string, string[]>; formErrors?: string[] }> {
    let payload: ApiEnvelope<unknown> | null = null;

    try {
      payload = (await response.json()) as ApiEnvelope<unknown>;
    } catch {
      // Response wasn't valid JSON
    }

    if (payload?.error === "Validation failed" && payload.details) {
    // Filter out undefined values from fieldErrors
    const filteredFieldErrors = payload.details.fieldErrors
      ? Object.entries(payload.details.fieldErrors).reduce(
          (acc, [key, value]) => {
            if (value) {
              acc[key] = value;
            }
            return acc;
          },
          {} as Record<string, string[]>,
        )
      : undefined;

    return {
      message: payload.details.formErrors?.join(" ") ?? "Validation failed",
      fieldErrors: filteredFieldErrors,
      formErrors: payload.details.formErrors,
    };
    }

    return {
      message: payload?.error ?? `HTTP ${response.status}`,
    };
  }

  /**
   * Perform HTTP request with retry logic and timeout
   */
  async function request<T>(
    method: string,
    path: string,
    options: {
      body?: unknown;
      headers?: Record<string, string>;
      isFormData?: boolean;
    } = {},
  ): Promise<T> {
    const url = `${baseUrl}${path}`;
    const method_upper = method.toUpperCase();
    const canRetry = isSafeToRetry(method_upper);
    let lastError: Error | null = null;

    for (let attempt = 0; attempt <= (canRetry ? maxRetries : 0); attempt++) {
      try {
        if (attempt > 0) {
          const delay = getRetryDelay(attempt - 1);
          log(`Retrying request (attempt ${attempt + 1}/${maxRetries + 1}) after ${delay}ms`);
          await new Promise((resolve) => setTimeout(resolve, delay));
        }

        const fetchOptions: RequestInit = {
          method: method_upper,
        };

        if (options.body) {
          if (options.isFormData) {
            fetchOptions.body = options.body as FormData;
          } else {
            fetchOptions.body = JSON.stringify(options.body);
            fetchOptions.headers = {
              "Content-Type": "application/json",
              ...(options.headers ?? {}),
            };
          }
        } else if (options.headers) {
          fetchOptions.headers = options.headers;
        }

        log(`${method_upper} ${path}`, options.body);

        const response = await fetchWithTimeout(url, fetchOptions);

        if (!response.ok) {
          const errorData = await parseErrorResponse(response);
          const apiError = new ApiError(
            errorData.message,
            response.status,
            errorData.fieldErrors,
            errorData.formErrors,
          );

          // Retry on 5xx errors only for GET requests
          if (canRetry && isRetryableStatus(response.status) && attempt < maxRetries) {
            lastError = apiError;
            continue;
          }

          throw apiError;
        }

        const data = (await response.json()) as ApiEnvelope<T>;

        if (!data.data) {
          throw new Error(data.error ?? "Empty response from server");
        }

        log(`Success: ${method_upper} ${path}`, data.data);
        return data.data;
      } catch (error) {
        if (error instanceof ApiError) {
          throw error;
        }

        const err = error instanceof Error ? error : new Error(String(error));

        // Retry on network errors for GET requests
        if (canRetry && attempt < maxRetries) {
          lastError = err;
          continue;
        }

        throw err;
      }
    }

    // All retries exhausted
    throw lastError ?? new Error("Request failed after all retries");
  }

  return {
    get: <T,>(path: string, headers?: Record<string, string>) =>
      request<T>("GET", path, { headers }),

    post: <T,>(path: string, body: unknown, isFormData = false) =>
      request<T>("POST", path, { body, isFormData }),

    patch: <T,>(path: string, body: unknown) =>
      request<T>("PATCH", path, { body }),

    delete: <T,>(path: string) =>
      request<T>("DELETE", path),

    request,
  };
}

export type ApiClient = ReturnType<typeof createApiClient>;
