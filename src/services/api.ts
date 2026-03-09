import { supabase } from "@/integrations/supabase/client";

const API_BASE_URL = "http://localhost:4000/api";

/**
 * Shared fetch wrapper that includes the Supabase JWT token in the Authorization header.
 */
export async function apiFetch(endpoint: string, options: RequestInit = {}) {
  const { data: { session } } = await supabase.auth.getSession();
  const token = session?.access_token;

  const headers = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || data.message || "An error occurred");
  }

  return data;
}
