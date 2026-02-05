const ACCESS_TOKEN_KEY = "accessToken";

const isBrowser = typeof window !== "undefined";

export const getAccessToken = (): string | null => {
  if (isBrowser) {
    return localStorage.getItem(ACCESS_TOKEN_KEY);
  }
  return null;
};

export const setAccessToken = (token: string | null): void => {
  if (isBrowser) {
    if (token) {
      localStorage.setItem(ACCESS_TOKEN_KEY, token);
    } else {
      localStorage.removeItem(ACCESS_TOKEN_KEY);
    }
  }
};

export const clearAuthStorage = (): void => {
  if (isBrowser) {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
  }
};
