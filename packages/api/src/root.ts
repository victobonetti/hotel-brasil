import { authRouter } from "./router/auth";
import { catalogAdminRouter } from "./router/catalog-admin";
import { guestSessionRouter } from "./router/guest-session";
import { menuRouter } from "./router/menu";
import { orderRouter } from "./router/order";
import { roomAdminRouter } from "./router/room-admin";
import { staffOnboardingRouter } from "./router/staff-onboarding";
import { staffOrderRouter } from "./router/staff-order";
import { createTRPCRouter } from "./trpc";

export const appRouter = createTRPCRouter({
	auth: authRouter,
	catalogAdmin: catalogAdminRouter,
	guestSession: guestSessionRouter,
	menu: menuRouter,
	order: orderRouter,
	roomAdmin: roomAdminRouter,
	staffOnboarding: staffOnboardingRouter,
	staffOrder: staffOrderRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
