import { authRouter } from "./router/auth";
import { menuRouter } from "./router/menu";
import { createTRPCRouter } from "./trpc";

export const appRouter = createTRPCRouter({
	auth: authRouter,
	menu: menuRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
