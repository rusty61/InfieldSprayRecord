import { QueryClient, QueryFunction } from "@tanstack/react-query";

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL?.replace(/\/?$/, "") || "";

export function resolveApiUrl(path: string) {
  if (!path) return path;

  const hasProtocol = /^[a-zA-Z][a-zA-Z\d+\-.]*:\/\//.test(path);
  if (hasProtocol || !apiBaseUrl) {
    return path;
  }

  try {
    return new URL(path, apiBaseUrl).toString();
  } catch (error) {
    console.warn("Failed to resolve API URL", { path, apiBaseUrl, error });
    const needsSlash = !apiBaseUrl.endsWith("/") && !path.startsWith("/");
    return `${apiBaseUrl}${needsSlash ? "/" : ""}${path}`;
  }
}

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
): Promise<Response> {
  const res = await fetch(resolveApiUrl(url), {
    method,
    headers: data ? { "Content-Type": "application/json" } : {},
    body: data ? JSON.stringify(data) : undefined,
    credentials: "include",
  });

  await throwIfResNotOk(res);
  return res;
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    const requestUrl = resolveApiUrl(queryKey.join("/") as string);
    const res = await fetch(requestUrl, {
      credentials: "include",
    });

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null;
    }

    await throwIfResNotOk(res);
    return await res.json();
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});
