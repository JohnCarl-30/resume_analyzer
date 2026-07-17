const DEFAULT_AFTER_AUTH_PATH = "/home";

export function resolveSafeRedirectPath(
  value: string | null | undefined,
  fallback = DEFAULT_AFTER_AUTH_PATH,
): string {
  if (!value || !value.startsWith("/") || value.startsWith("//")) {
    return fallback;
  }

  return value;
}

export { DEFAULT_AFTER_AUTH_PATH };
