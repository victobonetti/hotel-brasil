import type { inferRouterInputs, inferRouterOutputs } from "@trpc/server";

import type { AppRouter } from "./root";

/**
 * Inference helpers for input types
 * @example
 * type PostByIdInput = RouterInputs['post']['byId']
 *      ^? { id: number }
 */
type RouterInputs = inferRouterInputs<AppRouter>;

/**
 * Inference helpers for output types
 * @example
 * type AllPostsOutput = RouterOutputs['post']['all']
 *      ^? Post[]
 */
type RouterOutputs = inferRouterOutputs<AppRouter>;

export { type AppRouter, appRouter } from "./root";
export { createTRPCContext } from "./trpc";
export {
	calculateOrderTotal,
	canTransitionOrderStatus,
	isMenuItemAvailable,
	transitionOrderStatus,
	validateOrderCreation,
	type OrderCreationItem,
	type OrderCreationPayload,
	type OrderTotalLineItem,
	type TransitionableOrder,
} from "./domain/order";
export { generateGuestSessionToken } from "./domain/guest-session";
export { belongsToHotel } from "./domain/tenancy";
export type { RouterInputs, RouterOutputs };
