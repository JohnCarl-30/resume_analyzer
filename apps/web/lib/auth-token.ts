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

export async function getAccessToken() {
  if (!accessTokenGetter) {
    return null;
  }

  return accessTokenGetter();
}
