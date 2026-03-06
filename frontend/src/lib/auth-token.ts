type TokenListener = (token: string | null) => void;

let accessToken: string | null = null;
const listeners = new Set<TokenListener>();

function notifyListeners() {
  for (const listener of listeners) {
    listener(accessToken);
  }
}

export function getAccessToken() {
  return accessToken;
}

export function setAccessToken(token: string) {
  accessToken = token;
  notifyListeners();
}

export function clearAccessToken() {
  accessToken = null;
  notifyListeners();
}

export function subscribeToAccessToken(listener: TokenListener) {
  listeners.add(listener);

  return () => {
    listeners.delete(listener);
  };
}
