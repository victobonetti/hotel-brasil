import { menuCategories, menuItems } from "@nowait24/db/schema";
import { PAGE_SIZES } from "@nowait24/utils";
import type { TRPCRouterRecord } from "@trpc/server";
import { TRPCError } from "@trpc/server";
import { count, eq, inArray } from "drizzle-orm";
import { z } from "zod/v4";
import { mapDomainErrorToUserMessage } from "../errors";
import {
	CatalogAdminServiceError,
	createCategory,
	createMenuItem,
	listCategoriesForStaff,
	listMenuItemsForStaff,
	reorderCategories,
	toggleMenuItemAvailability,
	updateCategory,
	updateMenuItem,
} from "../services/catalog-admin-service";
import { protectedProcedure } from "../trpc";

function mapCatalogAdminServiceError(error: unknown): never {
	if (error instanceof CatalogAdminServiceError) {
		const userMessage = mapDomainErrorToUserMessage(error, "staff");

		if (
			error.code === "STAFF_MEMBERSHIP_REQUIRED" ||
			error.code === "TENANT_MISMATCH" ||
			error.code === "UNAUTHORIZED_ROLE"
		) {
			throw new TRPCError({ code: "FORBIDDEN", message: userMessage.message });
		}

		if (
			error.code === "CATEGORY_NOT_FOUND" ||
			error.code === "ITEM_NOT_FOUND"
		) {
			throw new TRPCError({ code: "NOT_FOUND", message: userMessage.message });
		}

		if (error.code === "INVALID_PRICE" || error.code === "INVALID_IMAGE") {
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

async function findMembershipByUserId(ctx: { db: any }, userId: string) {
	const membership = await ctx.db.query.staffUserHotels.findFirst({
		columns: { hotelId: true, role: true, userId: true },
		where: (table: any, operators: { eq: typeof eq }) =>
			operators.eq(table.userId, userId),
	});

	return membership ?? null;
}

const categoryPayload = z.object({
	active: z.boolean().optional(),
	description: z.string().optional(),
	name: z.string().min(1),
	sortOrder: z.number().int().nonnegative().optional(),
});

const itemPayload = z.object({
	available: z.boolean().optional(),
	categoryId: z.string().min(1),
	description: z.string().optional(),
	imageUrl: z.string().optional(),
	name: z.string().min(1),
	preparationTimeMinutes: z.number().int().nonnegative().optional(),
	priceInCents: z.number().int(),
});

const pageInput = z
	.object({
		page: z.number().int().optional(),
	})
	.optional();

export const catalogAdminRouter = {
	createCategory: protectedProcedure
		.input(categoryPayload)
		.mutation(async ({ ctx, input }) => {
			try {
				return await createCategory(
					{
						createCategoryRecord: async (category) => {
							await ctx.db.insert(menuCategories).values(category);
						},
						findMembershipByUserId: async (userId) =>
							await findMembershipByUserId(ctx, userId),
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
	createMenuItem: protectedProcedure
		.input(itemPayload)
		.mutation(async ({ ctx, input }) => {
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
						findMembershipByUserId: async (userId) =>
							await findMembershipByUserId(ctx, userId),
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
		.input(pageInput)
		.query(async ({ ctx, input }) => {
			try {
				return await listCategoriesForStaff(
					{
						countCategoriesByHotelId: async (hotelId) => {
							const [result] = await ctx.db
								.select({ totalItems: count() })
								.from(menuCategories)
								.where(eq(menuCategories.hotelId, hotelId));

							return result?.totalItems ?? 0;
						},
						findMembershipByUserId: async (userId) =>
							await findMembershipByUserId(ctx, userId),
						listCategoriesByHotelId: async (hotelId, pagination) =>
							await ctx.db.query.menuCategories.findMany({
								limit: pagination.limit,
								offset: pagination.offset,
								orderBy: (table, { asc }) => [
									asc(table.sortOrder),
									asc(table.name),
								],
								where: (table, { eq }) => eq(table.hotelId, hotelId),
							}),
					},
					{
						page: input?.page,
						pageSize: PAGE_SIZES.staffCategories,
						userId: ctx.session.user.id,
					},
				);
			} catch (error) {
				mapCatalogAdminServiceError(error);
			}
		}),
	listCategoryOptions: protectedProcedure.query(async ({ ctx }) => {
		try {
			const result = await listCategoriesForStaff(
				{
					countCategoriesByHotelId: async (hotelId) => {
						const [record] = await ctx.db
							.select({ totalItems: count() })
							.from(menuCategories)
							.where(eq(menuCategories.hotelId, hotelId));

						return record?.totalItems ?? 0;
					},
					findMembershipByUserId: async (userId) =>
						await findMembershipByUserId(ctx, userId),
					listCategoriesByHotelId: async (hotelId, pagination) =>
						await ctx.db.query.menuCategories.findMany({
							limit: pagination.limit,
							offset: pagination.offset,
							orderBy: (table, { asc }) => [
								asc(table.sortOrder),
								asc(table.name),
							],
							where: (table, { eq }) => eq(table.hotelId, hotelId),
						}),
				},
				{
					page: 1,
					pageSize: PAGE_SIZES.staffCategoryOptions,
					userId: ctx.session.user.id,
				},
			);

			return result.items;
		} catch (error) {
			mapCatalogAdminServiceError(error);
		}
	}),
	listMenuItems: protectedProcedure
		.input(pageInput)
		.query(async ({ ctx, input }) => {
			try {
				return await listMenuItemsForStaff(
					{
						countMenuItemsByHotelId: async (hotelId) => {
							const [result] = await ctx.db
								.select({ totalItems: count() })
								.from(menuItems)
								.where(eq(menuItems.hotelId, hotelId));

							return result?.totalItems ?? 0;
						},
						findMembershipByUserId: async (userId) =>
							await findMembershipByUserId(ctx, userId),
						listMenuItemsByHotelId: async (hotelId, pagination) =>
							await ctx.db.query.menuItems.findMany({
								limit: pagination.limit,
								offset: pagination.offset,
								orderBy: (table, { asc }) => [asc(table.name)],
								where: (table, { eq }) => eq(table.hotelId, hotelId),
							}),
					},
					{
						page: input?.page,
						pageSize: PAGE_SIZES.staffMenuItems,
						userId: ctx.session.user.id,
					},
				);
			} catch (error) {
				mapCatalogAdminServiceError(error);
			}
		}),
	reorderCategories: protectedProcedure
		.input(
			z.object({
				categoryIds: z.array(z.string().min(1)).min(1),
			}),
		)
		.mutation(async ({ ctx, input }) => {
			try {
				return await reorderCategories(
					{
						findMembershipByUserId: async (userId) =>
							await findMembershipByUserId(ctx, userId),
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
						findMembershipByUserId: async (userId) =>
							await findMembershipByUserId(ctx, userId),
						findMenuItemById: async (itemId) =>
							(await ctx.db.query.menuItems.findFirst({
								where: (table, { eq }) => eq(table.id, itemId),
							})) ?? null,
						updateMenuItemRecord: async (itemId, item) => {
							await ctx.db
								.update(menuItems)
								.set(item)
								.where(eq(menuItems.id, itemId));
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
						findMembershipByUserId: async (userId) =>
							await findMembershipByUserId(ctx, userId),
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
						findMembershipByUserId: async (userId) =>
							await findMembershipByUserId(ctx, userId),
						findMenuItemById: async (itemId) =>
							(await ctx.db.query.menuItems.findFirst({
								where: (table, { eq }) => eq(table.id, itemId),
							})) ?? null,
						updateMenuItemRecord: async (itemId, item) => {
							await ctx.db
								.update(menuItems)
								.set(item)
								.where(eq(menuItems.id, itemId));
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
