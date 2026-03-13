const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:4000/api";
const TOKEN_KEY = "abhee_access_token";
const USER_KEY = "abhee_user";
const IMPERSONATED_AS_KEY = "impersonated_as";

export interface AppAuthUser {
  id: string;
  email: string;
}

export const AUTH_SESSION_EVENT = "abhee-auth-session-changed";

type AuthScope = "local" | "session";
type AuthSessionOptions = { scope?: AuthScope };

function hasSessionAuth() {
  return !!sessionStorage.getItem(TOKEN_KEY);
}

function getCurrentScope(): AuthScope {
  return hasSessionAuth() ? "session" : "local";
}

export function getAuthToken() {
  return sessionStorage.getItem(TOKEN_KEY) || localStorage.getItem(TOKEN_KEY);
}

export function setAuthSession(accessToken: string, user: AppAuthUser, options: AuthSessionOptions = {}) {
  const scope: AuthScope = options.scope || "local";
  // If the user logs in normally in a tab that previously impersonated someone,
  // clear the per-tab impersonation session so it doesn't override local login.
  if (scope === "local") {
    sessionStorage.removeItem(TOKEN_KEY);
    sessionStorage.removeItem(USER_KEY);
    sessionStorage.removeItem(IMPERSONATED_AS_KEY);
  }
  const storage = scope === "session" ? sessionStorage : localStorage;
  storage.setItem(TOKEN_KEY, accessToken);
  storage.setItem(USER_KEY, JSON.stringify(user));
  window.dispatchEvent(new Event(AUTH_SESSION_EVENT));
}

export function clearAuthSession(options: AuthSessionOptions = {}) {
  const scope: AuthScope = options.scope || getCurrentScope();
  const storage = scope === "session" ? sessionStorage : localStorage;
  storage.removeItem(TOKEN_KEY);
  storage.removeItem(USER_KEY);
  window.dispatchEvent(new Event(AUTH_SESSION_EVENT));
}

export function getStoredUser(): AppAuthUser | null {
  const raw = sessionStorage.getItem(USER_KEY) || localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as AppAuthUser;
  } catch {
    return null;
  }
}

export async function apiFetch(endpoint: string, options: RequestInit = {}) {
  const token = getAuthToken();
  const headers = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.error || data.message || "An error occurred");
  }
  return data;
}
