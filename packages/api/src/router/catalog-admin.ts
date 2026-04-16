import type { TRPCRouterRecord } from "@trpc/server";
import { TRPCError } from "@trpc/server";
import { eq, inArray } from "drizzle-orm";
import { z } from "zod/v4";

import { menuCategories, menuItems } from "@finchat/db/schema";
import {
	CatalogAdminServiceError,
	createCategory,
	createMenuItem,
	reorderCategories,
	toggleMenuItemAvailability,
	updateCategory,
	updateMenuItem,
} from "../services/catalog-admin-service";
import { protectedProcedure } from "../trpc";

function mapCatalogAdminServiceError(error: unknown): never {
	if (error instanceof CatalogAdminServiceError) {
		if (
			error.code === "STAFF_MEMBERSHIP_REQUIRED" ||
			error.code === "TENANT_MISMATCH" ||
			error.code === "UNAUTHORIZED_ROLE"
		) {
			throw new TRPCError({ code: "FORBIDDEN", message: error.message });
		}

		if (error.code === "CATEGORY_NOT_FOUND" || error.code === "ITEM_NOT_FOUND") {
			throw new TRPCError({ code: "NOT_FOUND", message: error.message });
		}

		if (error.code === "INVALID_PRICE") {
			throw new TRPCError({ code: "BAD_REQUEST", message: error.message });
		}
	}

	throw error;
}

const categoryPayload = z.object({
	active: z.boolean().optional(),
	description: z.string().optional(),
	hotelId: z.string().min(1),
	name: z.string().min(1),
	sortOrder: z.number().int().nonnegative().optional(),
});

const itemPayload = z.object({
	available: z.boolean().optional(),
	categoryId: z.string().min(1),
	description: z.string().optional(),
	hotelId: z.string().min(1),
	imageUrl: z.string().optional(),
	name: z.string().min(1),
	preparationTimeMinutes: z.number().int().nonnegative().optional(),
	priceInCents: z.number().int(),
});

export const catalogAdminRouter = {
	createCategory: protectedProcedure.input(categoryPayload).mutation(async ({ ctx, input }) => {
		try {
			return await createCategory(
				{
					createCategoryRecord: async (category) => {
						await ctx.db.insert(menuCategories).values(category);
					},
					findMembershipByUserId: async (userId) => {
						const membership = await ctx.db.query.staffUserHotels.findFirst({
							columns: { hotelId: true, role: true, userId: true },
							where: (table, { eq }) => eq(table.userId, userId),
						});
						return membership ?? null;
					},
					listCategoriesByHotelId: async (hotelId) =>
						await ctx.db.query.menuCategories.findMany({
							where: (table, { eq }) => eq(table.hotelId, hotelId),
						}),
				},
				{
					...input,
					userId: ctx.session.user.id,
				},
			);
		} catch (error) {
			mapCatalogAdminServiceError(error);
		}
	}),
	createMenuItem: protectedProcedure.input(itemPayload).mutation(async ({ ctx, input }) => {
		try {
			return await createMenuItem(
				{
					createMenuItemRecord: async (item) => {
						await ctx.db.insert(menuItems).values(item);
					},
					findCategoryById: async (categoryId) =>
						(await ctx.db.query.menuCategories.findFirst({
							where: (table, { eq }) => eq(table.id, categoryId),
						})) ?? null,
					findMembershipByUserId: async (userId) => {
						const membership = await ctx.db.query.staffUserHotels.findFirst({
							columns: { hotelId: true, role: true, userId: true },
							where: (table, { eq }) => eq(table.userId, userId),
						});
						return membership ?? null;
					},
				},
				{
					...input,
					userId: ctx.session.user.id,
				},
			);
		} catch (error) {
			mapCatalogAdminServiceError(error);
		}
	}),
	listCategories: protectedProcedure
		.input(
			z.object({
				hotelId: z.string().min(1),
			}),
		)
		.query(async ({ ctx, input }) =>
			await ctx.db.query.menuCategories.findMany({
				orderBy: (table, { asc }) => [asc(table.sortOrder), asc(table.name)],
				where: (table, { eq }) => eq(table.hotelId, input.hotelId),
			}),
		),
	listMenuItems: protectedProcedure
		.input(
			z.object({
				hotelId: z.string().min(1),
			}),
		)
		.query(async ({ ctx, input }) =>
			await ctx.db.query.menuItems.findMany({
				orderBy: (table, { asc }) => [asc(table.name)],
				where: (table, { eq }) => eq(table.hotelId, input.hotelId),
			}),
		),
	reorderCategories: protectedProcedure
		.input(
			z.object({
				categoryIds: z.array(z.string().min(1)).min(1),
				hotelId: z.string().min(1),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			try {
				return await reorderCategories(
					{
						findMembershipByUserId: async (userId) => {
							const membership = await ctx.db.query.staffUserHotels.findFirst({
								columns: { hotelId: true, role: true, userId: true },
								where: (table, { eq }) => eq(table.userId, userId),
							});
							return membership ?? null;
						},
						listCategoriesByIds: async (categoryIds) =>
							categoryIds.length === 0
								? []
								: await ctx.db
										.select()
										.from(menuCategories)
										.where(inArray(menuCategories.id, categoryIds)),
						updateCategoryRecord: async (categoryId, category) => {
							await ctx.db
								.update(menuCategories)
								.set(category)
								.where(eq(menuCategories.id, categoryId));
						},
					},
					{
						...input,
						userId: ctx.session.user.id,
					},
				);
			} catch (error) {
				mapCatalogAdminServiceError(error);
			}
		}),
	toggleMenuItemAvailability: protectedProcedure
		.input(
			z.object({
				itemId: z.string().min(1),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			try {
				return await toggleMenuItemAvailability(
					{
						findMembershipByUserId: async (userId) => {
							const membership = await ctx.db.query.staffUserHotels.findFirst({
								columns: { hotelId: true, role: true, userId: true },
								where: (table, { eq }) => eq(table.userId, userId),
							});
							return membership ?? null;
						},
						findMenuItemById: async (itemId) =>
							(await ctx.db.query.menuItems.findFirst({
								where: (table, { eq }) => eq(table.id, itemId),
							})) ?? null,
						updateMenuItemRecord: async (itemId, item) => {
							await ctx.db.update(menuItems).set(item).where(eq(menuItems.id, itemId));
						},
					},
					{
						itemId: input.itemId,
						userId: ctx.session.user.id,
					},
				);
			} catch (error) {
				mapCatalogAdminServiceError(error);
			}
		}),
	updateCategory: protectedProcedure
		.input(
			z.object({
				active: z.boolean().optional(),
				categoryId: z.string().min(1),
				description: z.string().optional(),
				name: z.string().optional(),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			try {
				return await updateCategory(
					{
						findCategoryById: async (categoryId) =>
							(await ctx.db.query.menuCategories.findFirst({
								where: (table, { eq }) => eq(table.id, categoryId),
							})) ?? null,
						findMembershipByUserId: async (userId) => {
							const membership = await ctx.db.query.staffUserHotels.findFirst({
								columns: { hotelId: true, role: true, userId: true },
								where: (table, { eq }) => eq(table.userId, userId),
							});
							return membership ?? null;
						},
						updateCategoryRecord: async (categoryId, category) => {
							await ctx.db
								.update(menuCategories)
								.set(category)
								.where(eq(menuCategories.id, categoryId));
						},
					},
					{
						...input,
						userId: ctx.session.user.id,
					},
				);
			} catch (error) {
				mapCatalogAdminServiceError(error);
			}
		}),
	updateMenuItem: protectedProcedure
		.input(
			z.object({
				available: z.boolean().optional(),
				categoryId: z.string().optional(),
				description: z.string().optional(),
				imageUrl: z.string().optional(),
				itemId: z.string().min(1),
				name: z.string().optional(),
				preparationTimeMinutes: z.number().int().nonnegative().optional(),
				priceInCents: z.number().int().optional(),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			try {
				return await updateMenuItem(
					{
						findCategoryById: async (categoryId) =>
							(await ctx.db.query.menuCategories.findFirst({
								where: (table, { eq }) => eq(table.id, categoryId),
							})) ?? null,
						findMembershipByUserId: async (userId) => {
							const membership = await ctx.db.query.staffUserHotels.findFirst({
								columns: { hotelId: true, role: true, userId: true },
								where: (table, { eq }) => eq(table.userId, userId),
							});
							return membership ?? null;
						},
						findMenuItemById: async (itemId) =>
							(await ctx.db.query.menuItems.findFirst({
								where: (table, { eq }) => eq(table.id, itemId),
							})) ?? null,
						updateMenuItemRecord: async (itemId, item) => {
							await ctx.db.update(menuItems).set(item).where(eq(menuItems.id, itemId));
						},
					},
					{
						...input,
						userId: ctx.session.user.id,
					},
				);
			} catch (error) {
				mapCatalogAdminServiceError(error);
			}
		}),
} satisfies TRPCRouterRecord;
