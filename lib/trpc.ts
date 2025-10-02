import { createTRPCReact } from '@trpc/react-query';
import { createTRPCClient, httpBatchLink } from '@trpc/client';
import { QueryClient } from '@tanstack/react-query';
import superjson from 'superjson';
import type { AppRouter } from '../backend/trpc/app-router';

// Create tRPC React hooks
export const trpc = createTRPCReact<AppRouter>();

// Get the base URL from environment variables
const getBaseUrl = () => {
  // For web, use the environment variable or fallback to current origin
  if (typeof window !== 'undefined') {
    const envUrl = process.env.EXPO_PUBLIC_RORK_API_BASE_URL;
    if (envUrl) return envUrl;
    return window.location.origin;
  }
  
  // For mobile, use the environment variable
  const envUrl = process.env.EXPO_PUBLIC_RORK_API_BASE_URL;
  if (envUrl) return envUrl;
  
  // Fallback
  return 'http://localhost:3000';
};

// Create tRPC client
export const trpcClient = createTRPCClient<AppRouter>({
  links: [
    httpBatchLink({
      url: `${getBaseUrl()}/api/trpc`,
      transformer: superjson,
      headers() {
        return {
          'Content-Type': 'application/json',
        };
      },
    }),
  ],
});

// Create Query Client
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes
      retry: 2,
      refetchOnWindowFocus: false,
    },
  },
});