import { authRouter } from "./router/auth";
import { menuRouter } from "./router/menu";
import { orderRouter } from "./router/order";
import { createTRPCRouter } from "./trpc";

export const appRouter = createTRPCRouter({
	auth: authRouter,
	menu: menuRouter,
	order: orderRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
