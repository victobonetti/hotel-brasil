import { guestSessions, hotels, rooms } from "@nowait24/db/schema";
import type { TRPCRouterRecord } from "@trpc/server";
import { TRPCError } from "@trpc/server";
import { eq, gt } from "drizzle-orm";
import { z } from "zod/v4";
import { mapDomainErrorToUserMessage } from "../errors";
import {
	createGuestSessionFromRoomToken,
	GuestSessionServiceError,
	refreshGuestSession,
	resolveGuestSession,
} from "../services/guest-session-service";
import { publicProcedure } from "../trpc";

function mapGuestSessionServiceError(error: unknown): never {
	if (error instanceof GuestSessionServiceError) {
		const userMessage = mapDomainErrorToUserMessage(error, "guest");

		if (
			error.code === "GUEST_SESSION_EXPIRED" ||
			error.code === "HOTEL_INACTIVE" ||
			error.code === "ROOM_INACTIVE"
		) {
			throw new TRPCError({ code: "FORBIDDEN", message: userMessage.message });
		}

		if (
			error.code === "GUEST_SESSION_NOT_FOUND" ||
			error.code === "ROOM_TOKEN_NOT_FOUND"
		) {
			throw new TRPCError({ code: "NOT_FOUND", message: userMessage.message });
		}
	}

	const fallback = mapDomainErrorToUserMessage(error, "guest");
	throw new TRPCError({
		code: "INTERNAL_SERVER_ERROR",
		message: fallback.message,
	});
}

export const guestSessionRouter = {
	createGuestSessionFromRoomToken: publicProcedure
		.input(
			z.object({
				roomToken: z.string().min(1),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			try {
				return await createGuestSessionFromRoomToken(
					{
						createGuestSession: async (session) => {
							await ctx.db.insert(guestSessions).values(session);
						},
						findActiveGuestSessionByRoomId: async (roomId, now) => {
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
								.where(gt(guestSessions.expiresAt, now))
								.limit(1);

							return (
								result.find((session) => session.roomId === roomId) ?? null
							);
						},
						findGuestSessionByToken: () => null,
						findRoomByQrCodeToken: async (qrCodeToken) => {
							const result = await ctx.db
								.select({
									hotelActive: hotels.active,
									hotelId: rooms.hotelId,
									qrCodeToken: rooms.qrCodeToken,
									roomActive: rooms.active,
									roomId: rooms.id,
								})
								.from(rooms)
								.innerJoin(hotels, eq(hotels.id, rooms.hotelId))
								.where(eq(rooms.qrCodeToken, qrCodeToken))
								.limit(1);

							return result[0] ?? null;
						},
						updateGuestSessionExpiry: () => undefined,
					},
					input,
				);
			} catch (error) {
				mapGuestSessionServiceError(error);
			}
		}),
	refreshGuestSession: publicProcedure
		.input(
			z.object({
				guestSessionToken: z.string().min(1),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			try {
				return await refreshGuestSession(
					{
						createGuestSession: () => undefined,
						findActiveGuestSessionByRoomId: () => null,
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
						findRoomByQrCodeToken: () => null,
						updateGuestSessionExpiry: async (token, expiresAt) => {
							await ctx.db
								.update(guestSessions)
								.set({ expiresAt })
								.where(eq(guestSessions.token, token));
						},
					},
					input,
				);
			} catch (error) {
				mapGuestSessionServiceError(error);
			}
		}),
	resolveGuestSession: publicProcedure
		.input(
			z.object({
				guestSessionToken: z.string().min(1),
			}),
		)
		.query(async ({ ctx, input }) => {
			try {
				return await resolveGuestSession(
					{
						createGuestSession: () => undefined,
						findActiveGuestSessionByRoomId: () => null,
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
						findRoomByQrCodeToken: () => null,
						updateGuestSessionExpiry: () => undefined,
					},
					input,
				);
			} catch (error) {
				mapGuestSessionServiceError(error);
			}
		}),
} satisfies TRPCRouterRecord;
