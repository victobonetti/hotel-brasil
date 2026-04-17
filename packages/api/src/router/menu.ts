import { PAGE_SIZES } from "@finchat/utils";
import type { TRPCRouterRecord } from "@trpc/server";
import { TRPCError } from "@trpc/server";
import { asc } from "drizzle-orm";
import { z } from "zod/v4";
import { mapDomainErrorToUserMessage } from "../errors";
import {
	getMenuForGuestSession,
	listAvailableItems,
	listCategoriesByHotel,
	MenuServiceError,
} from "../services/menu-service";
import { publicProcedure } from "../trpc";

function mapMenuServiceError(error: unknown): never {
	if (error instanceof MenuServiceError) {
		const userMessage = mapDomainErrorToUserMessage(error, "guest");

		if (error.code === "GUEST_SESSION_EXPIRED") {
			throw new TRPCError({
				code: "FORBIDDEN",
				message: userMessage.message,
			});
		}

		if (error.code === "GUEST_SESSION_NOT_FOUND") {
			throw new TRPCError({
				code: "NOT_FOUND",
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

export const menuRouter = {
	getMenuForGuestSession: publicProcedure
		.input(
			z.object({
				guestSessionToken: z.string().min(1),
				page: z.number().int().optional(),
			}),
		)
		.query(async ({ ctx, input }) => {
			try {
				return await getMenuForGuestSession(
					{
						findGuestSessionByToken: async (token) =>
							await ctx.db.query.guestSessions
								.findFirst({
									columns: {
										expiresAt: true,
										hotelId: true,
										id: true,
										roomId: true,
										token: true,
									},
									where: (table, { eq }) => eq(table.token, token),
									with: {
										room: {
											columns: {
												label: true,
											},
										},
									},
								})
								.then((session) =>
									session
										? {
												expiresAt: session.expiresAt,
												hotelId: session.hotelId,
												id: session.id,
												roomId: session.roomId,
												roomLabel: session.room?.label ?? null,
												token: session.token,
											}
										: null,
								),
						listCategoriesByHotel: (hotelId) =>
							ctx.db.query.menuCategories.findMany({
								columns: {
									active: true,
									description: true,
									hotelId: true,
									id: true,
									name: true,
									sortOrder: true,
								},
								orderBy: (table, { asc }) => [
									asc(table.sortOrder),
									asc(table.name),
								],
								where: (table, { eq }) => eq(table.hotelId, hotelId),
							}),
						listItemsByHotel: (hotelId) =>
							ctx.db.query.menuItems.findMany({
								columns: {
									available: true,
									categoryId: true,
									description: true,
									hotelId: true,
									id: true,
									imageUrl: true,
									name: true,
									preparationTimeMinutes: true,
									priceInCents: true,
								},
								orderBy: (table, { asc }) => [asc(table.name)],
								where: (table, { eq }) => eq(table.hotelId, hotelId),
							}),
					},
					{
						...input,
						pageSize: PAGE_SIZES.guestMenuCategories,
					},
				);
			} catch (error) {
				mapMenuServiceError(error);
			}
		}),
	listAvailableItems: publicProcedure
		.input(
			z.object({
				guestSessionToken: z.string().min(1),
			}),
		)
		.query(async ({ ctx, input }) => {
			try {
				const guestSession = await ctx.db.query.guestSessions.findFirst({
					columns: {
						hotelId: true,
						token: true,
					},
					where: (table, { eq }) => eq(table.token, input.guestSessionToken),
				});

				if (!guestSession) {
					throw new MenuServiceError(
						"GUEST_SESSION_NOT_FOUND",
						"Guest session token is invalid",
					);
				}

				const [categories, items] = await Promise.all([
					ctx.db.query.menuCategories.findMany({
						columns: {
							active: true,
							description: true,
							hotelId: true,
							id: true,
							name: true,
							sortOrder: true,
						},
						where: (table, { eq }) => eq(table.hotelId, guestSession.hotelId),
					}),
					ctx.db.query.menuItems.findMany({
						columns: {
							available: true,
							categoryId: true,
							description: true,
							hotelId: true,
							id: true,
							imageUrl: true,
							name: true,
							preparationTimeMinutes: true,
							priceInCents: true,
						},
						where: (table, { eq }) => eq(table.hotelId, guestSession.hotelId),
					}),
				]);

				const visibleCategories = listCategoriesByHotel(
					categories,
					guestSession.hotelId,
				);
				return listAvailableItems(
					items,
					guestSession.hotelId,
					visibleCategories.map((category) => category.id),
				);
			} catch (error) {
				mapMenuServiceError(error);
			}
		}),
	listCategoriesByHotel: publicProcedure
		.input(
			z.object({
				guestSessionToken: z.string().min(1),
			}),
		)
		.query(async ({ ctx, input }) => {
			try {
				const guestSession = await ctx.db.query.guestSessions.findFirst({
					columns: {
						hotelId: true,
						token: true,
					},
					where: (table, { eq }) => eq(table.token, input.guestSessionToken),
				});

				if (!guestSession) {
					throw new MenuServiceError(
						"GUEST_SESSION_NOT_FOUND",
						"Guest session token is invalid",
					);
				}

				const categories = await ctx.db.query.menuCategories.findMany({
					columns: {
						active: true,
						description: true,
						hotelId: true,
						id: true,
						name: true,
						sortOrder: true,
					},
					orderBy: (table) => [asc(table.sortOrder), asc(table.name)],
					where: (table, { eq }) => eq(table.hotelId, guestSession.hotelId),
				});

				return listCategoriesByHotel(categories, guestSession.hotelId);
			} catch (error) {
				mapMenuServiceError(error);
			}
		}),
} satisfies TRPCRouterRecord;
