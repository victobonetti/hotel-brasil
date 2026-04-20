import { rooms } from "@nowait24/db/schema";
import { PAGE_SIZES } from "@nowait24/utils";
import type { TRPCRouterRecord } from "@trpc/server";
import { TRPCError } from "@trpc/server";
import { asc, count, eq } from "drizzle-orm";
import { z } from "zod/v4";
import { mapDomainErrorToUserMessage } from "../errors";
import {
	createRoom,
	listRoomsForStaff,
	RoomAdminServiceError,
	regenerateRoomToken,
	updateRoom,
} from "../services/room-admin-service";
import { protectedProcedure } from "../trpc";
import { findStaffMembershipByUserId } from "./staff-membership";

function mapRoomAdminServiceError(error: unknown): never {
	if (error instanceof RoomAdminServiceError) {
		const userMessage = mapDomainErrorToUserMessage(error, "staff");

		if (
			error.code === "STAFF_MEMBERSHIP_REQUIRED" ||
			error.code === "TENANT_MISMATCH" ||
			error.code === "UNAUTHORIZED_ROLE"
		) {
			throw new TRPCError({ code: "FORBIDDEN", message: userMessage.message });
		}

		if (error.code === "ROOM_NOT_FOUND") {
			throw new TRPCError({ code: "NOT_FOUND", message: userMessage.message });
		}

		if (error.code === "ROOM_LABEL_CONFLICT") {
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

const pageInput = z
	.object({
		page: z.number().int().optional(),
	})
	.optional();

export const roomAdminRouter = {
	createRoom: protectedProcedure
		.input(
			z.object({
				active: z.boolean().optional(),
				floor: z.number().int().optional(),
				label: z.string().min(1),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			try {
				return await createRoom(
					{
						createRoomRecord: async (room) => {
							await ctx.db.insert(rooms).values(room);
						},
						findMembershipByUserId: async (userId) =>
							await findStaffMembershipByUserId(ctx.db, userId),
						listRoomsByHotelId: async (hotelId) =>
							await ctx.db.query.rooms.findMany({
								where: (table, { eq }) => eq(table.hotelId, hotelId),
							}),
					},
					{
						...input,
						userId: ctx.session.user.id,
					},
				);
			} catch (error) {
				mapRoomAdminServiceError(error);
			}
		}),
	listRooms: protectedProcedure
		.input(pageInput)
		.query(async ({ ctx, input }) => {
			try {
				return await listRoomsForStaff(
					{
						countRoomsByHotelId: async (hotelId) => {
							const [result] = await ctx.db
								.select({ totalItems: count() })
								.from(rooms)
								.where(eq(rooms.hotelId, hotelId));

							return result?.totalItems ?? 0;
						},
						findMembershipByUserId: async (userId) =>
							await findStaffMembershipByUserId(ctx.db, userId),
						listRoomsByHotelId: async (hotelId, pagination) =>
							await ctx.db.query.rooms.findMany({
								limit: pagination.limit,
								offset: pagination.offset,
								orderBy: (table) => [asc(table.floor), asc(table.label)],
								where: (table, { eq }) => eq(table.hotelId, hotelId),
							}),
					},
					{
						page: input?.page,
						pageSize: PAGE_SIZES.staffRooms,
						userId: ctx.session.user.id,
					},
				);
			} catch (error) {
				mapRoomAdminServiceError(error);
			}
		}),
	regenerateRoomToken: protectedProcedure
		.input(
			z.object({
				roomId: z.string().min(1),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			try {
				return await regenerateRoomToken(
					{
						findMembershipByUserId: async (userId) =>
							await findStaffMembershipByUserId(ctx.db, userId),
						findRoomById: async (roomId) =>
							(await ctx.db.query.rooms.findFirst({
								where: (table, { eq }) => eq(table.id, roomId),
							})) ?? null,
						updateRoomRecord: async (roomId, room) => {
							await ctx.db.update(rooms).set(room).where(eq(rooms.id, roomId));
						},
					},
					{
						roomId: input.roomId,
						userId: ctx.session.user.id,
					},
				);
			} catch (error) {
				mapRoomAdminServiceError(error);
			}
		}),
	updateRoom: protectedProcedure
		.input(
			z.object({
				active: z.boolean().optional(),
				floor: z.number().int().nullable().optional(),
				label: z.string().min(1).optional(),
				roomId: z.string().min(1),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			try {
				return await updateRoom(
					{
						findMembershipByUserId: async (userId) =>
							await findStaffMembershipByUserId(ctx.db, userId),
						findRoomById: async (roomId) =>
							(await ctx.db.query.rooms.findFirst({
								where: (table, { eq }) => eq(table.id, roomId),
							})) ?? null,
						listRoomsByHotelId: async (hotelId) =>
							await ctx.db.query.rooms.findMany({
								where: (table, { eq }) => eq(table.hotelId, hotelId),
							}),
						updateRoomRecord: async (roomId, room) => {
							await ctx.db.update(rooms).set(room).where(eq(rooms.id, roomId));
						},
					},
					{
						...input,
						userId: ctx.session.user.id,
					},
				);
			} catch (error) {
				mapRoomAdminServiceError(error);
			}
		}),
} satisfies TRPCRouterRecord;
