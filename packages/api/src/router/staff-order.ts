import { orderStatusHistories, orders } from "@finchat/db/schema";
import { PAGE_SIZES } from "@finchat/utils";
import type { TRPCRouterRecord } from "@trpc/server";
import { TRPCError } from "@trpc/server";
import { count, eq } from "drizzle-orm";
import { z } from "zod/v4";
import { mapDomainErrorToUserMessage } from "../errors";
import {
	listActiveOrders,
	OrderServiceError,
	transitionStaffOrderStatus,
} from "../services/order-service";
import { protectedProcedure } from "../trpc";

function mapStaffOrderServiceError(error: unknown): never {
	if (error instanceof OrderServiceError) {
		const userMessage = mapDomainErrorToUserMessage(error, "staff");

		if (
			error.code === "STAFF_MEMBERSHIP_REQUIRED" ||
			error.code === "TENANT_MISMATCH" ||
			error.code === "MENU_ITEM_UNAVAILABLE"
		) {
			throw new TRPCError({ code: "FORBIDDEN", message: userMessage.message });
		}

		if (error.code === "ORDER_NOT_FOUND") {
			throw new TRPCError({ code: "NOT_FOUND", message: userMessage.message });
		}

		if (error.code === "ORDER_TRANSITION_INVALID") {
			throw new TRPCError({
				code: "BAD_REQUEST",
				message: userMessage.message,
			});
		}
	}

	const fallback = mapDomainErrorToUserMessage(error, "staff");
	throw new TRPCError({
		code: "INTERNAL_SERVER_ERROR",
		message: fallback.message,
	});
}

const orderActionSchema = z.object({
	orderId: z.string().min(1),
});

const pageInput = z
	.object({
		page: z.number().int().optional(),
	})
	.optional();

function logAuditEvent(entry: unknown) {
	void entry;
}

export const staffOrderRouter = {
	acceptOrder: protectedProcedure
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
						logAuditEvent,
						updateOrder: async (orderId, order) => {
							await ctx.db
								.update(orders)
								.set(order)
								.where(eq(orders.id, orderId));
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
	cancelOrder: protectedProcedure
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
						logAuditEvent,
						updateOrder: async (orderId, order) => {
							await ctx.db
								.update(orders)
								.set(order)
								.where(eq(orders.id, orderId));
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
	getOrderDetails: protectedProcedure
		.input(orderActionSchema)
		.query(async ({ ctx, input }) => {
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
						and(
							eq(table.id, input.orderId),
							eq(table.hotelId, membership.hotelId),
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
					throw new OrderServiceError("ORDER_NOT_FOUND", "Order was not found");
				}

				return order;
			} catch (error) {
				mapStaffOrderServiceError(error);
			}
		}),
	listActiveOrders: protectedProcedure
		.input(pageInput)
		.query(async ({ ctx, input }) => {
			try {
				return await listActiveOrders(
					{
						countOrdersByHotelId: async (hotelId) => {
							const [result] = await ctx.db
								.select({ totalItems: count() })
								.from(orders)
								.where(eq(orders.hotelId, hotelId));

							return result?.totalItems ?? 0;
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
						listOrdersByHotelId: async (hotelId, pagination) =>
							await ctx.db.query.orders.findMany({
								limit: pagination.limit,
								offset: pagination.offset,
								orderBy: (table, { asc }) => [asc(table.placedAt)],
								where: (table, { eq }) => eq(table.hotelId, hotelId),
								with: {
									room: {
										columns: {
											label: true,
										},
									},
								},
							}),
					},
					{
						page: input?.page,
						pageSize: PAGE_SIZES.staffOperationalOrders,
						userId: ctx.session.user.id,
					},
				);
			} catch (error) {
				mapStaffOrderServiceError(error);
			}
		}),
	markOrderDelivered: protectedProcedure
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
						logAuditEvent,
						updateOrder: async (orderId, order) => {
							await ctx.db
								.update(orders)
								.set(order)
								.where(eq(orders.id, orderId));
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
						logAuditEvent,
						updateOrder: async (orderId, order) => {
							await ctx.db
								.update(orders)
								.set(order)
								.where(eq(orders.id, orderId));
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
	markOrderPreparing: protectedProcedure
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
						logAuditEvent,
						updateOrder: async (orderId, order) => {
							await ctx.db
								.update(orders)
								.set(order)
								.where(eq(orders.id, orderId));
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
