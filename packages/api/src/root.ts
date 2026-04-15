import { authRouter } from "./router/auth";
import { guestSessionRouter } from "./router/guest-session";
import { menuRouter } from "./router/menu";
import { orderRouter } from "./router/order";
import { staffOrderRouter } from "./router/staff-order";
import { createTRPCRouter } from "./trpc";

export const appRouter = createTRPCRouter({
	auth: authRouter,
	guestSession: guestSessionRouter,
	menu: menuRouter,
	order: orderRouter,
	staffOrder: staffOrderRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
