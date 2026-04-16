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
export {
	assertGuestSessionIsActive,
	assertRoomCanCreateGuestSession,
	type GuestSessionContext,
	type RoomTokenContext,
} from "./domain/guest-session";
export { belongsToHotel } from "./domain/tenancy";
export {
	getMenuForGuestSession,
	listAvailableItems,
	listCategoriesByHotel,
	MenuServiceError,
	type GuestMenuView,
	type MenuCategoryWithItems,
	type MenuItemView,
} from "./services/menu-service";
export {
	createOrderFromGuestSession,
	getOrderByGuestSession,
	getOrderTracking,
	listGuestOrders,
	listOrderStatusHistory,
	OrderServiceError,
	type InAppOrderStatusNotification,
	type OrderTrackingView,
} from "./services/order-service";
export {
	assertGuestSessionCanOrder,
	assertMenuItemsBelongToHotel,
	assertUserCanManageHotel,
	buildOrderStatusEvent,
	buildOrderItemSnapshots,
	createInitialStatusHistory,
	listOperationalOrders,
	shouldNotifyGuest,
	transitionOrderStatusWithAudit,
	type RequestedOrderItem,
	type OrderItemSnapshot,
} from "./domain/order";
export {
	createCategory,
	createMenuItem,
	reorderCategories,
	toggleMenuItemAvailability,
	updateCategory,
	updateMenuItem,
	CatalogAdminServiceError,
	type CatalogCategoryRecord,
	type CatalogMenuItemRecord,
} from "./services/catalog-admin-service";
export {
	createGuestSessionFromRoomToken,
	refreshGuestSession,
	resolveGuestSession,
	GuestSessionServiceError,
} from "./services/guest-session-service";
export type { RouterInputs, RouterOutputs };
