import {
	guestSessions,
	hotels,
	menuItems,
	orderItems,
	orderStatusHistories,
	orders,
	rooms,
} from "@finchat/db/schema";
import type { TRPCRouterRecord } from "@trpc/server";
import { TRPCError } from "@trpc/server";
import { desc, eq, inArray } from "drizzle-orm";
import { z } from "zod/v4";
import { mapDomainErrorToUserMessage } from "../errors";
import {
	createOrderFromGuestSession,
	type GuestOrderListItem,
	getOrderByGuestSession,
	getOrderTracking,
	listGuestOrders,
	listOrderStatusHistory,
	OrderServiceError,
} from "../services/order-service";
import { publicProcedure } from "../trpc";

function mapOrderServiceError(error: unknown): never {
	if (error instanceof OrderServiceError) {
		const userMessage = mapDomainErrorToUserMessage(error, "guest");

		if (
			error.code === "GUEST_SESSION_EXPIRED" ||
			error.code === "HOTEL_INACTIVE" ||
			error.code === "ROOM_INACTIVE" ||
			error.code === "MENU_ITEM_UNAVAILABLE" ||
			error.code === "TENANT_MISMATCH"
		) {
			throw new TRPCError({ code: "FORBIDDEN", message: userMessage.message });
		}

		if (
			error.code === "GUEST_SESSION_NOT_FOUND" ||
			error.code === "ORDER_NOT_FOUND" ||
			error.code === "MENU_ITEM_NOT_FOUND"
		) {
			throw new TRPCError({ code: "NOT_FOUND", message: userMessage.message });
		}

		if (error.code === "ORDER_TRANSITION_INVALID") {
			throw new TRPCError({
				code: "BAD_REQUEST",
				message: userMessage.message,
			});
		}
	}

	const fallback = mapDomainErrorToUserMessage(error, "guest");
	throw new TRPCError({
		code: "INTERNAL_SERVER_ERROR",
		message: fallback.message,
	});
}

const guestOrderItemSchema = z.object({
	menuItemId: z.string().min(1),
	notes: z.string().optional(),
	quantity: z.number().int().positive(),
});

export const orderRouter = {
	createOrderFromGuestSession: publicProcedure
		.input(
			z.object({
				guestSessionToken: z.string().min(1),
				items: z.array(guestOrderItemSchema).min(1),
				orderNotes: z.string().optional(),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			try {
				return await createOrderFromGuestSession(
					{
						createOrder: async (order, items, history) => {
							await ctx.db.transaction(async (tx) => {
								await tx.insert(orders).values(order);
								await tx.insert(orderItems).values(items);
								await tx.insert(orderStatusHistories).values(history);
							});
						},
						findGuestSessionByToken: async (token) => {
							const result = await ctx.db
								.select({
									expiresAt: guestSessions.expiresAt,
									hotelActive: hotels.active,
									hotelId: guestSessions.hotelId,
									id: guestSessions.id,
									roomActive: rooms.active,
									roomId: guestSessions.roomId,
									roomLabel: rooms.label,
									token: guestSessions.token,
								})
								.from(guestSessions)
								.innerJoin(hotels, eq(hotels.id, guestSessions.hotelId))
								.innerJoin(rooms, eq(rooms.id, guestSessions.roomId))
								.where(eq(guestSessions.token, token))
								.limit(1);

							return result[0] ?? null;
						},
						findOrderTrackingByGuestSession: () => null,
						listGuestOrders: () => [],
						loadMenuItems: async (menuItemIds) =>
							menuItemIds.length === 0
								? []
								: await ctx.db
										.select({
											available: menuItems.available,
											hotelId: menuItems.hotelId,
											id: menuItems.id,
											name: menuItems.name,
											priceInCents: menuItems.priceInCents,
										})
										.from(menuItems)
										.where(inArray(menuItems.id, menuItemIds)),
						logAuditEvent: (_entry) => {},
					},
					input,
				);
			} catch (error) {
				mapOrderServiceError(error);
			}
		}),
	getOrderByGuestSession: publicProcedure
		.input(
			z.object({
				guestSessionToken: z.string().min(1),
				orderId: z.string().min(1),
			}),
		)
		.query(async ({ ctx, input }) => {
			try {
				const tracking = await getOrderByGuestSession(
					{
						createOrder: () => undefined,
						findGuestSessionByToken: async (token) => {
							const result = await ctx.db
								.select({
									expiresAt: guestSessions.expiresAt,
									hotelActive: hotels.active,
									hotelId: guestSessions.hotelId,
									id: guestSessions.id,
									roomActive: rooms.active,
									roomId: guestSessions.roomId,
									roomLabel: rooms.label,
									token: guestSessions.token,
								})
								.from(guestSessions)
								.innerJoin(hotels, eq(hotels.id, guestSessions.hotelId))
								.innerJoin(rooms, eq(rooms.id, guestSessions.roomId))
								.where(eq(guestSessions.token, token))
								.limit(1);

							return result[0] ?? null;
						},
						findOrderTrackingByGuestSession: async (
							guestSessionId,
							orderId,
						) => {
							const order = await ctx.db.query.orders.findFirst({
								where: (table, { and, eq }) =>
									and(
										eq(table.id, orderId),
										eq(table.guestSessionId, guestSessionId),
									),
								with: {
									items: true,
									room: {
										columns: {
											label: true,
										},
									},
									statusHistory: {
										orderBy: (table, { asc }) => [asc(table.changedAt)],
									},
								},
							});

							if (!order) {
								return null;
							}

							return {
								history: order.statusHistory,
								order,
							};
						},
						listGuestOrders: () => [],
						loadMenuItems: () => [],
					},
					input,
				);

				const room = await ctx.db.query.rooms.findFirst({
					columns: {
						label: true,
					},
					where: (table, { eq }) => eq(table.id, tracking.order.roomId),
				});

				return {
					...tracking,
					order: {
						...tracking.order,
						roomLabel: room?.label ?? null,
					},
				};
			} catch (error) {
				mapOrderServiceError(error);
			}
		}),
	getOrderTracking: publicProcedure
		.input(
			z.object({
				guestSessionToken: z.string().min(1),
				orderId: z.string().min(1),
			}),
		)
		.query(async ({ ctx, input }) => {
			try {
				const tracking = await getOrderTracking(
					{
						createOrder: () => undefined,
						findGuestSessionByToken: async (token) => {
							const result = await ctx.db
								.select({
									expiresAt: guestSessions.expiresAt,
									hotelActive: hotels.active,
									hotelId: guestSessions.hotelId,
									id: guestSessions.id,
									roomActive: rooms.active,
									roomId: guestSessions.roomId,
									roomLabel: rooms.label,
									token: guestSessions.token,
								})
								.from(guestSessions)
								.innerJoin(hotels, eq(hotels.id, guestSessions.hotelId))
								.innerJoin(rooms, eq(rooms.id, guestSessions.roomId))
								.where(eq(guestSessions.token, token))
								.limit(1);

							return result[0] ?? null;
						},
						findOrderTrackingByGuestSession: async (
							guestSessionId,
							orderId,
						) => {
							const order = await ctx.db.query.orders.findFirst({
								where: (table, { and, eq }) =>
									and(
										eq(table.id, orderId),
										eq(table.guestSessionId, guestSessionId),
									),
								with: {
									items: true,
									room: {
										columns: {
											label: true,
										},
									},
									statusHistory: {
										orderBy: (table, { asc }) => [asc(table.changedAt)],
									},
								},
							});

							if (!order) {
								return null;
							}

							return {
								history: order.statusHistory,
								order,
							};
						},
						listGuestOrders: () => [],
						loadMenuItems: () => [],
					},
					input,
				);

				const room = await ctx.db.query.rooms.findFirst({
					columns: {
						label: true,
					},
					where: (table, { eq }) => eq(table.id, tracking.order.roomId),
				});

				return {
					...tracking,
					order: {
						...tracking.order,
						roomLabel: room?.label ?? null,
					},
				};
			} catch (error) {
				mapOrderServiceError(error);
			}
		}),
	listGuestOrders: publicProcedure
		.input(
			z.object({
				guestSessionToken: z.string().min(1),
			}),
		)
		.query(async ({ ctx, input }) => {
			try {
				return await listGuestOrders(
					{
						createOrder: () => undefined,
						findGuestSessionByToken: async (token) => {
							const result = await ctx.db
								.select({
									expiresAt: guestSessions.expiresAt,
									hotelActive: hotels.active,
									hotelId: guestSessions.hotelId,
									id: guestSessions.id,
									roomActive: rooms.active,
									roomId: guestSessions.roomId,
									token: guestSessions.token,
								})
								.from(guestSessions)
								.innerJoin(hotels, eq(hotels.id, guestSessions.hotelId))
								.innerJoin(rooms, eq(rooms.id, guestSessions.roomId))
								.where(eq(guestSessions.token, token))
								.limit(1);

							return result[0] ?? null;
						},
						findOrderTrackingByGuestSession: () => null,
						listGuestOrders: async (guestSessionId) => {
							const guestOrders = await ctx.db.query.orders.findMany({
								orderBy: (table, { desc }) => [desc(table.placedAt)],
								where: (table, { eq }) =>
									eq(table.guestSessionId, guestSessionId),
								with: {
									room: {
										columns: {
											label: true,
										},
									},
								},
							});

							return guestOrders.map(
								(order): GuestOrderListItem => ({
									acceptedAt: order.acceptedAt,
									cancelledAt: order.cancelledAt,
									deliveredAt: order.deliveredAt,
									deliveringAt: order.deliveringAt,
									guestSessionId: order.guestSessionId,
									hotelId: order.hotelId,
									id: order.id,
									notes: order.notes,
									placedAt: order.placedAt,
									preparingAt: order.preparingAt,
									roomId: order.roomId,
									roomLabel: order.room.label,
									status: order.status,
									totalAmountInCents: order.totalAmountInCents,
								}),
							);
						},
						loadMenuItems: () => [],
					},
					input,
				);
			} catch (error) {
				mapOrderServiceError(error);
			}
		}),
	listOrderStatusHistory: publicProcedure
		.input(
			z.object({
				guestSessionToken: z.string().min(1),
				orderId: z.string().min(1),
			}),
		)
		.query(async ({ ctx, input }) => {
			try {
				return await listOrderStatusHistory(
					{
						createOrder: () => undefined,
						findGuestSessionByToken: async (token) => {
							const result = await ctx.db
								.select({
									expiresAt: guestSessions.expiresAt,
									hotelActive: hotels.active,
									hotelId: guestSessions.hotelId,
									id: guestSessions.id,
									roomActive: rooms.active,
									roomId: guestSessions.roomId,
									token: guestSessions.token,
								})
								.from(guestSessions)
								.innerJoin(hotels, eq(hotels.id, guestSessions.hotelId))
								.innerJoin(rooms, eq(rooms.id, guestSessions.roomId))
								.where(eq(guestSessions.token, token))
								.limit(1);

							return result[0] ?? null;
						},
						findOrderTrackingByGuestSession: async (
							guestSessionId,
							orderId,
						) => {
							const order = await ctx.db.query.orders.findFirst({
								where: (table, { and, eq }) =>
									and(
										eq(table.id, orderId),
										eq(table.guestSessionId, guestSessionId),
									),
								with: {
									items: true,
									statusHistory: {
										orderBy: (table, { asc }) => [asc(table.changedAt)],
									},
								},
							});

							if (!order) {
								return null;
							}

							return {
								history: order.statusHistory,
								order,
							};
						},
						listGuestOrders: () => [],
						loadMenuItems: () => [],
					},
					input,
				);
			} catch (error) {
				mapOrderServiceError(error);
			}
		}),
} satisfies TRPCRouterRecord;
