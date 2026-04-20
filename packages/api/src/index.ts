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

export {
	assertGuestSessionIsActive,
	assertRoomCanCreateGuestSession,
	type GuestSessionContext,
	generateGuestSessionToken,
	type RoomTokenContext,
} from "./domain/guest-session";
export {
	assertGuestSessionCanOrder,
	assertMenuItemsBelongToHotel,
	assertOrderExists,
	assertUserCanManageHotel,
	buildOrderItemSnapshots,
	buildOrderStatusEvent,
	calculateOrderTotal,
	canTransitionOrderStatus,
	createInitialStatusHistory,
	createOrderAuditContext,
	isMenuItemAvailable,
	listOperationalOrders,
	type OrderAuditContext,
	type OrderCreationItem,
	type OrderCreationPayload,
	type OrderItemSnapshot,
	type OrderTotalLineItem,
	type RequestedOrderItem,
	shouldNotifyGuest,
	type TransitionableOrder,
	transitionOrderStatus,
	transitionOrderStatusWithAudit,
	validateOrderCreation,
} from "./domain/order";
export {
	assertResourceBelongsToTenant,
	belongsToHotel,
	createTenantScope,
	type TenantScope,
} from "./domain/tenancy";
export {
	mapDomainErrorToUserMessage,
	type UserFacingAudience,
	type UserFacingErrorMessage,
} from "./errors";

export { type AppRouter, appRouter } from "./root";
export {
	CatalogAdminServiceError,
	type CatalogCategoryRecord,
	type CatalogMenuItemRecord,
	createCategory,
	createMenuItem,
	listCategoriesForStaff,
	listMenuItemsForStaff,
	reorderCategories,
	toggleMenuItemAvailability,
	updateCategory,
	updateMenuItem,
} from "./services/catalog-admin-service";
export {
	createGuestSessionFromRoomToken,
	GuestSessionServiceError,
	refreshGuestSession,
	resolveGuestSession,
} from "./services/guest-session-service";
export {
	createInitialHotel,
	getHotelOnboardingStatus,
	type HotelOnboardingInput,
	HotelOnboardingServiceError,
	type HotelOnboardingStatus,
	normalizeHotelOnboardingInput,
	normalizeHotelSlug,
} from "./services/hotel-onboarding-service";
export {
	type GuestMenuView,
	getMenuForGuestSession,
	listAvailableItems,
	listCategoriesByHotel,
	type MenuCategoryWithItems,
	type MenuItemView,
	MenuServiceError,
} from "./services/menu-service";
export {
	createOrderFromGuestSession,
	type GuestOrderListItem,
	getOrderByGuestSession,
	getOrderTracking,
	type InAppOrderStatusNotification,
	listGuestOrders,
	listOrderStatusHistory,
	OrderServiceError,
	type OrderTrackingView,
} from "./services/order-service";
export {
	createRoom,
	listRoomsForStaff,
	type RoomAdminRecord,
	RoomAdminServiceError,
	regenerateRoomToken,
	updateRoom,
} from "./services/room-admin-service";
export { createTRPCContext } from "./trpc";
export type { RouterInputs, RouterOutputs };
