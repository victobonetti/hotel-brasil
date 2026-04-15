import type { TRPCRouterRecord } from "@trpc/server";
import { TRPCError } from "@trpc/server";
import { z } from "zod/v4";

import {
	getMenuForGuestSession,
	listAvailableItems,
	listCategoriesByHotel,
	MenuServiceError,
} from "../services/menu-service";
import { publicProcedure } from "../trpc";

function mapMenuServiceError(error: unknown): never {
	if (error instanceof MenuServiceError) {
		if (error.code === "GUEST_SESSION_EXPIRED") {
			throw new TRPCError({
				code: "FORBIDDEN",
				message: error.message,
			});
		}

		if (error.code === "GUEST_SESSION_NOT_FOUND") {
			throw new TRPCError({
				code: "NOT_FOUND",
				message: error.message,
			});
		}
	}

	throw error;
}

export const menuRouter = {
	getMenuForGuestSession: publicProcedure
		.input(
			z.object({
				guestSessionToken: z.string().min(1),
			}),
		)
		.query(async ({ ctx, input }) => {
			try {
				return await getMenuForGuestSession(
					{
						findGuestSessionByToken: async (token) =>
							(await ctx.db.query.guestSessions.findFirst({
								columns: {
									expiresAt: true,
									hotelId: true,
									id: true,
									roomId: true,
									token: true,
								},
								where: (table, { eq }) => eq(table.token, token),
							})) ?? null,
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
					input,
				);
			} catch (error) {
				mapMenuServiceError(error);
			}
		}),
	listAvailableItems: publicProcedure
		.input(
			z.object({
				hotelId: z.string().min(1),
			}),
		)
		.query(async ({ ctx, input }) => {
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
					where: (table, { eq }) => eq(table.hotelId, input.hotelId),
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
					where: (table, { eq }) => eq(table.hotelId, input.hotelId),
				}),
			]);

			const visibleCategories = listCategoriesByHotel(categories, input.hotelId);
			return listAvailableItems(
				items,
				input.hotelId,
				visibleCategories.map((category) => category.id),
			);
		}),
	listCategoriesByHotel: publicProcedure
		.input(
			z.object({
				hotelId: z.string().min(1),
			}),
		)
		.query(async ({ ctx, input }) => {
			const categories = await ctx.db.query.menuCategories.findMany({
				columns: {
					active: true,
					description: true,
					hotelId: true,
					id: true,
					name: true,
					sortOrder: true,
				},
				where: (table, { eq }) => eq(table.hotelId, input.hotelId),
			});

			return listCategoriesByHotel(categories, input.hotelId);
		}),
} satisfies TRPCRouterRecord;
