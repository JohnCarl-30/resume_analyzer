const TOKEN_STORAGE_KEY = "resumae_access_token";
const TOKEN_EXPIRY_KEY = "resumae_access_token_expiry";

let accessTokenGetter: (() => Promise<string | null>) | null = null;
let unauthorizedHandler: (() => void) | null = null;

export function setAccessTokenGetter(getter: () => Promise<string | null>) {
  accessTokenGetter = getter;
}

export function setUnauthorizedHandler(handler: (() => void) | null) {
  unauthorizedHandler = handler;
}

export function notifyUnauthorized() {
  unauthorizedHandler?.();
}

function getStoredToken(): string | null {
  try {
    const token = sessionStorage.getItem(TOKEN_STORAGE_KEY);
    const expiry = sessionStorage.getItem(TOKEN_EXPIRY_KEY);

    if (!token || !expiry) {
      return null;
    }

    // Check if token is expired (with 5-minute buffer)
    if (Date.now() >= parseInt(expiry, 10) - 5 * 60 * 1000) {
      sessionStorage.removeItem(TOKEN_STORAGE_KEY);
      sessionStorage.removeItem(TOKEN_EXPIRY_KEY);
      return null;
    }

    return token;
  } catch {
    // sessionStorage not available or error
    return null;
  }
}

function storeToken(token: string): void {
  try {
    sessionStorage.setItem(TOKEN_STORAGE_KEY, token);

    // Decode JWT to get expiry (payload is base64url encoded)
    const parts = token.split(".");
    if (parts.length === 3) {
      const payload = JSON.parse(atob(parts[1]!.replace(/-/g, "+").replace(/_/g, "/")));
      if (payload.exp) {
        // exp is in seconds
        sessionStorage.setItem(TOKEN_EXPIRY_KEY, String(payload.exp * 1000));
      }
    }
  } catch {
    // sessionStorage not available or error
  }
}

export function clearStoredToken(): void {
  try {
    sessionStorage.removeItem(TOKEN_STORAGE_KEY);
    sessionStorage.removeItem(TOKEN_EXPIRY_KEY);
  } catch {
    // ignore
  }
}

export async function getAccessToken(): Promise<string | null> {
  // Check sessionStorage first
  const storedToken = getStoredToken();
  if (storedToken) {
    return storedToken;
  }

  if (!accessTokenGetter) {
    return null;
  }

  const token = await accessTokenGetter();

  // Store in sessionStorage for next time
  if (token) {
    storeToken(token);
  }

  return token;
}
