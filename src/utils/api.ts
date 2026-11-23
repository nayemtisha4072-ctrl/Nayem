/**
 * Safe API client utility to prevent "Unexpected token '<', <html><head>..." errors
 * Ensures robust JSON handling with automatic error recovery and proper content-type checking.
 */

export interface ApiResponse<T = any> {
  ok: boolean;
  status: number;
  data?: T;
  error?: string;
}

export async function safeApiFetch<T = any>(
  url: string,
  options?: RequestInit
): Promise<ApiResponse<T>> {
  try {
    const res = await fetch(url, {
      ...options,
      headers: {
        Accept: 'application/json',
        ...(options?.headers || {}),
      },
    });

    const contentType = res.headers.get('content-type') || '';

    if (contentType.includes('application/json')) {
      try {
        const data = await res.json();
        if (!res.ok) {
          return {
            ok: false,
            status: res.status,
            error: data.error || data.message || `Request failed with status ${res.status}`,
            data,
          };
        }
        return { ok: true, status: res.status, data };
      } catch (jsonErr: any) {
        return {
          ok: false,
          status: res.status,
          error: 'Server returned invalid JSON format',
        };
      }
    } else {
      // Non-JSON response (e.g. HTML 404 or 500 error page)
      const text = await res.text();
      return {
        ok: false,
        status: res.status,
        error: res.status === 404
          ? `Resource not found: ${url}`
          : `Unexpected non-JSON response from server (Status ${res.status})`,
      };
    }
  } catch (netErr: any) {
    return {
      ok: false,
      status: 0,
      error: netErr.message || 'Network connection failed',
    };
  }
}
