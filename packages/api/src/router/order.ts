import type { TRPCRouterRecord } from "@trpc/server";
import { TRPCError } from "@trpc/server";
import { z } from "zod/v4";

import {
	guestSessions,
	hotels,
	menuItems,
	orderItems,
	orders,
	orderStatusHistories,
	rooms,
} from "@finchat/db/schema";
import { and, asc, desc, eq, inArray } from "drizzle-orm";
import {
	createOrderFromGuestSession,
	getOrderByGuestSession,
	getOrderTracking,
	listGuestOrders,
	listOrderStatusHistory,
	OrderServiceError,
} from "../services/order-service";
import { publicProcedure } from "../trpc";

function mapOrderServiceError(error: unknown): never {
	if (error instanceof OrderServiceError) {
		if (
			error.code === "GUEST_SESSION_EXPIRED" ||
			error.code === "HOTEL_INACTIVE" ||
			error.code === "ROOM_INACTIVE" ||
			error.code === "MENU_ITEM_UNAVAILABLE" ||
			error.code === "TENANT_MISMATCH"
		) {
			throw new TRPCError({ code: "FORBIDDEN", message: error.message });
		}

		if (
			error.code === "GUEST_SESSION_NOT_FOUND" ||
			error.code === "ORDER_NOT_FOUND" ||
			error.code === "MENU_ITEM_NOT_FOUND"
		) {
			throw new TRPCError({ code: "NOT_FOUND", message: error.message });
		}
	}

	throw error;
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
				return await getOrderByGuestSession(
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
						findOrderTrackingByGuestSession: async (guestSessionId, orderId) => {
							const order = await ctx.db.query.orders.findFirst({
								with: {
									items: true,
									statusHistory: {
										orderBy: (table, { asc }) => [asc(table.changedAt)],
									},
								},
								where: (table, { and, eq }) =>
									and(
										eq(table.id, orderId),
										eq(table.guestSessionId, guestSessionId),
									),
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
	getOrderTracking: publicProcedure
		.input(
			z.object({
				guestSessionToken: z.string().min(1),
				orderId: z.string().min(1),
			}),
		)
		.query(async ({ ctx, input }) => {
			try {
				return await getOrderTracking(
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
						findOrderTrackingByGuestSession: async (guestSessionId, orderId) => {
							const order = await ctx.db.query.orders.findFirst({
								with: {
									items: true,
									statusHistory: {
										orderBy: (table, { asc }) => [asc(table.changedAt)],
									},
								},
								where: (table, { and, eq }) =>
									and(
										eq(table.id, orderId),
										eq(table.guestSessionId, guestSessionId),
									),
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
						listGuestOrders: async (guestSessionId) =>
							await ctx.db
								.select()
								.from(orders)
								.where(eq(orders.guestSessionId, guestSessionId))
								.orderBy(desc(orders.placedAt)),
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
						findOrderTrackingByGuestSession: async (guestSessionId, orderId) => {
							const order = await ctx.db.query.orders.findFirst({
								with: {
									items: true,
									statusHistory: {
										orderBy: (table, { asc }) => [asc(table.changedAt)],
									},
								},
								where: (table, { and, eq }) =>
									and(
										eq(table.id, orderId),
										eq(table.guestSessionId, guestSessionId),
									),
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
