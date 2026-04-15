import type { TRPCRouterRecord } from "@trpc/server";
import { TRPCError } from "@trpc/server";
import { asc, eq } from "drizzle-orm";
import { z } from "zod/v4";

import { orders, orderStatusHistories, staffUserHotels } from "@finchat/db/schema";
import {
	getOrderTracking,
	listActiveOrders,
	OrderServiceError,
	transitionStaffOrderStatus,
} from "../services/order-service";
import { protectedProcedure } from "../trpc";

function mapStaffOrderServiceError(error: unknown): never {
	if (error instanceof OrderServiceError) {
		if (
			error.code === "STAFF_MEMBERSHIP_REQUIRED" ||
			error.code === "TENANT_MISMATCH" ||
			error.code === "MENU_ITEM_UNAVAILABLE"
		) {
			throw new TRPCError({ code: "FORBIDDEN", message: error.message });
		}

		if (error.code === "ORDER_NOT_FOUND") {
			throw new TRPCError({ code: "NOT_FOUND", message: error.message });
		}
	}

	throw error;
}

const orderActionSchema = z.object({
	orderId: z.string().min(1),
});

export const staffOrderRouter = {
	acceptOrder: protectedProcedure.input(orderActionSchema).mutation(async ({ ctx, input }) => {
		try {
			return await transitionStaffOrderStatus(
				{
					createHistoryEntry: async (history) => {
						await ctx.db.insert(orderStatusHistories).values(history);
					},
					findMembershipByUserId: async (userId) => {
						const result = await ctx.db.query.staffUserHotels.findFirst({
							columns: {
								hotelId: true,
								role: true,
								userId: true,
							},
							where: (table, { eq }) => eq(table.userId, userId),
						});
						return result ?? null;
					},
					findOrderById: async (orderId) =>
						(await ctx.db.query.orders.findFirst({
							where: (table, { eq }) => eq(table.id, orderId),
						})) ?? null,
					updateOrder: async (orderId, order) => {
						await ctx.db.update(orders).set(order).where(eq(orders.id, orderId));
					},
				},
				{
					nextStatus: "accepted",
					orderId: input.orderId,
					userId: ctx.session.user.id,
				},
			);
		} catch (error) {
			mapStaffOrderServiceError(error);
		}
	}),
	cancelOrder: protectedProcedure.input(orderActionSchema).mutation(async ({ ctx, input }) => {
		try {
			return await transitionStaffOrderStatus(
				{
					createHistoryEntry: async (history) => {
						await ctx.db.insert(orderStatusHistories).values(history);
					},
					findMembershipByUserId: async (userId) => {
						const result = await ctx.db.query.staffUserHotels.findFirst({
							columns: {
								hotelId: true,
								role: true,
								userId: true,
							},
							where: (table, { eq }) => eq(table.userId, userId),
						});
						return result ?? null;
					},
					findOrderById: async (orderId) =>
						(await ctx.db.query.orders.findFirst({
							where: (table, { eq }) => eq(table.id, orderId),
						})) ?? null,
					updateOrder: async (orderId, order) => {
						await ctx.db.update(orders).set(order).where(eq(orders.id, orderId));
					},
				},
				{
					nextStatus: "cancelled",
					orderId: input.orderId,
					userId: ctx.session.user.id,
				},
			);
		} catch (error) {
			mapStaffOrderServiceError(error);
		}
	}),
	getOrderDetails: protectedProcedure.input(orderActionSchema).query(async ({ ctx, input }) => {
		try {
			const membership = await ctx.db.query.staffUserHotels.findFirst({
				columns: {
					hotelId: true,
					role: true,
					userId: true,
				},
				where: (table, { eq }) => eq(table.userId, ctx.session.user.id),
			});

			if (!membership) {
				throw new OrderServiceError(
					"STAFF_MEMBERSHIP_REQUIRED",
					"User is not assigned to this hotel",
				);
			}

			const order = await ctx.db.query.orders.findFirst({
				where: (table, { and, eq }) =>
					and(eq(table.id, input.orderId), eq(table.hotelId, membership.hotelId)),
				with: {
					items: true,
					statusHistory: {
						orderBy: (table, { asc }) => [asc(table.changedAt)],
					},
				},
			});

			if (!order) {
				throw new OrderServiceError("ORDER_NOT_FOUND", "Order was not found");
			}

			return order;
		} catch (error) {
			mapStaffOrderServiceError(error);
		}
	}),
	listActiveOrders: protectedProcedure.query(async ({ ctx }) => {
		try {
			return await listActiveOrders(
				{
					findMembershipByUserId: async (userId) => {
						const result = await ctx.db.query.staffUserHotels.findFirst({
							columns: {
								hotelId: true,
								role: true,
								userId: true,
							},
							where: (table, { eq }) => eq(table.userId, userId),
						});
						return result ?? null;
					},
					listOrdersByHotelId: async (hotelId) =>
						await ctx.db
							.select()
							.from(orders)
							.where(eq(orders.hotelId, hotelId))
							.orderBy(asc(orders.placedAt)),
				},
				{ userId: ctx.session.user.id },
			);
		} catch (error) {
			mapStaffOrderServiceError(error);
		}
	}),
	markOrderDelivered: protectedProcedure.input(orderActionSchema).mutation(async ({ ctx, input }) => {
		try {
			return await transitionStaffOrderStatus(
				{
					createHistoryEntry: async (history) => {
						await ctx.db.insert(orderStatusHistories).values(history);
					},
					findMembershipByUserId: async (userId) => {
						const result = await ctx.db.query.staffUserHotels.findFirst({
							columns: {
								hotelId: true,
								role: true,
								userId: true,
							},
							where: (table, { eq }) => eq(table.userId, userId),
						});
						return result ?? null;
					},
					findOrderById: async (orderId) =>
						(await ctx.db.query.orders.findFirst({
							where: (table, { eq }) => eq(table.id, orderId),
						})) ?? null,
					updateOrder: async (orderId, order) => {
						await ctx.db.update(orders).set(order).where(eq(orders.id, orderId));
					},
				},
				{
					nextStatus: "delivered",
					orderId: input.orderId,
					userId: ctx.session.user.id,
				},
			);
		} catch (error) {
			mapStaffOrderServiceError(error);
		}
	}),
	markOrderOutForDelivery: protectedProcedure
		.input(orderActionSchema)
		.mutation(async ({ ctx, input }) => {
			try {
				return await transitionStaffOrderStatus(
					{
						createHistoryEntry: async (history) => {
							await ctx.db.insert(orderStatusHistories).values(history);
						},
						findMembershipByUserId: async (userId) => {
							const result = await ctx.db.query.staffUserHotels.findFirst({
								columns: {
									hotelId: true,
									role: true,
									userId: true,
								},
								where: (table, { eq }) => eq(table.userId, userId),
							});
							return result ?? null;
						},
						findOrderById: async (orderId) =>
							(await ctx.db.query.orders.findFirst({
								where: (table, { eq }) => eq(table.id, orderId),
							})) ?? null,
						updateOrder: async (orderId, order) => {
							await ctx.db.update(orders).set(order).where(eq(orders.id, orderId));
						},
					},
					{
						nextStatus: "out_for_delivery",
						orderId: input.orderId,
						userId: ctx.session.user.id,
					},
				);
			} catch (error) {
				mapStaffOrderServiceError(error);
			}
		}),
	markOrderPreparing: protectedProcedure.input(orderActionSchema).mutation(async ({ ctx, input }) => {
		try {
			return await transitionStaffOrderStatus(
				{
					createHistoryEntry: async (history) => {
						await ctx.db.insert(orderStatusHistories).values(history);
					},
					findMembershipByUserId: async (userId) => {
						const result = await ctx.db.query.staffUserHotels.findFirst({
							columns: {
								hotelId: true,
								role: true,
								userId: true,
							},
							where: (table, { eq }) => eq(table.userId, userId),
						});
						return result ?? null;
					},
					findOrderById: async (orderId) =>
						(await ctx.db.query.orders.findFirst({
							where: (table, { eq }) => eq(table.id, orderId),
						})) ?? null,
					updateOrder: async (orderId, order) => {
						await ctx.db.update(orders).set(order).where(eq(orders.id, orderId));
					},
				},
				{
					nextStatus: "preparing",
					orderId: input.orderId,
					userId: ctx.session.user.id,
				},
			);
		} catch (error) {
			mapStaffOrderServiceError(error);
		}
	}),
} satisfies TRPCRouterRecord;
