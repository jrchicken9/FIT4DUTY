import { createTRPCRouter } from "./create-context";
import hiRoute from "./routes/example/hi/route";
import statusRoute from "./routes/example/status/route";
import ApplicationAnalyticsRouter from "./routes/application/analytics/route";

export const appRouter = createTRPCRouter({
  example: createTRPCRouter({
    hi: hiRoute,
    status: statusRoute,
  }),
  application: createTRPCRouter({
    analytics: ApplicationAnalyticsRouter,
  }),
});

export type AppRouter = typeof appRouter;