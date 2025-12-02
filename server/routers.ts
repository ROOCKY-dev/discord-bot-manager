import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router, protectedProcedure } from "./_core/trpc";
import { z } from "zod";

export const appRouter = router({
    // if you need to use socket.io, read and register route in server/_core/index.ts, all api should start with '/api/' so that the gateway can route correctly
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  bot: router({
    getServers: protectedProcedure.query(async () => {
      return { message: "Bot management endpoints ready" };
    }),
    getModerationLogs: protectedProcedure.input(z.object({ serverId: z.string() })).query(async ({ input }) => {
      const { getModerationLogs } = await import("./db");
      return await getModerationLogs(input.serverId, 50);
    }),
    getLeaderboard: protectedProcedure.input(z.object({ serverId: z.string(), type: z.enum(["balance", "xp", "reputation"]) })).query(async ({ input }) => {
      const { getLeaderboard } = await import("./db");
      return await getLeaderboard(input.serverId, input.type, 10);
    }),
  }),
});

export type AppRouter = typeof appRouter;
