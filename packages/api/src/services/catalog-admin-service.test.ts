import { describe, expect, test } from "bun:test";

import {
	createCategory,
	createMenuItem,
	listCategoriesForStaff,
	listMenuItemsForStaff,
	reorderCategories,
	toggleMenuItemAvailability,
	updateCategory,
	updateMenuItem,
} from "./catalog-admin-service";

const membership = {
	hotelId: "hotel-1",
	role: "manager" as const,
	userId: "user-1",
};

describe("createCategory", () => {
	test("creates a category for the correct hotel and assigns default sortOrder", async () => {
		const created = await createCategory(
			{
				createCategoryRecord: () => undefined,
				findMembershipByUserId: () => membership,
				listCategoriesByHotelId: () => [
					{
						active: true,
						description: null,
						hotelId: "hotel-1",
						id: "cat-1",
						name: "Breakfast",
						sortOrder: 0,
					},
				],
			},
			{
				name: "Lunch",
				userId: "user-1",
			},
		);

		expect(created.hotelId).toBe("hotel-1");
		expect(created.sortOrder).toBe(1);
	});
});

describe("updateCategory", () => {
	test("updates category fields inside the same hotel", async () => {
		const updated = await updateCategory(
			{
				findCategoryById: () => ({
					active: true,
					description: null,
					hotelId: "hotel-1",
					id: "cat-1",
					name: "Breakfast",
					sortOrder: 0,
				}),
				findMembershipByUserId: () => membership,
				updateCategoryRecord: () => undefined,
			},
			{
				categoryId: "cat-1",
				name: "Brunch",
				userId: "user-1",
			},
		);

		expect(updated.name).toBe("Brunch");
	});
});

describe("reorderCategories", () => {
	test("reorders categories without duplicating sortOrder", async () => {
		const reordered = await reorderCategories(
			{
				findMembershipByUserId: () => membership,
				listCategoriesByIds: () => [
					{
						active: true,
						description: null,
						hotelId: "hotel-1",
						id: "cat-2",
						name: "Lunch",
						sortOrder: 1,
					},
					{
						active: true,
						description: null,
						hotelId: "hotel-1",
						id: "cat-1",
						name: "Breakfast",
						sortOrder: 0,
					},
				],
				updateCategoryRecord: () => undefined,
			},
			{
				categoryIds: ["cat-2", "cat-1"],
				userId: "user-1",
			},
		);

		expect(reordered).toEqual([
			{ categoryId: "cat-2", sortOrder: 0 },
			{ categoryId: "cat-1", sortOrder: 1 },
		]);
	});
});

describe("createMenuItem", () => {
	test("creates a valid menu item for the same hotel", async () => {
		const item = await createMenuItem(
			{
				createMenuItemRecord: () => undefined,
				findCategoryById: () => ({
					active: true,
					description: null,
					hotelId: "hotel-1",
					id: "cat-1",
					name: "Breakfast",
					sortOrder: 0,
				}),
				findMembershipByUserId: () => membership,
			},
			{
				categoryId: "cat-1",
				name: "Burger",
				priceInCents: 4200,
				userId: "user-1",
			},
		);

		expect(item.hotelId).toBe("hotel-1");
		expect(item.priceInCents).toBe(4200);
	});

	test("rejects negative price", async () => {
		await expect(
			createMenuItem(
				{
					createMenuItemRecord: () => undefined,
					findCategoryById: () => ({
						active: true,
						description: null,
						hotelId: "hotel-1",
						id: "cat-1",
						name: "Breakfast",
						sortOrder: 0,
					}),
					findMembershipByUserId: () => membership,
				},
				{
					categoryId: "cat-1",
					name: "Burger",
					priceInCents: -1,
					userId: "user-1",
				},
			),
		).rejects.toMatchObject({ code: "INVALID_PRICE" });
	});
});

describe("listCategoriesForStaff", () => {
	test("returns only categories from the staff hotel", async () => {
		const categories = await listCategoriesForStaff(
			{
				findMembershipByUserId: () => membership,
				listCategoriesByHotelId: (hotelId) => [
					{
						active: true,
						description: null,
						hotelId,
						id: "cat-1",
						name: "Breakfast",
						sortOrder: 0,
					},
				],
			},
			{ userId: "user-1" },
		);

		expect(categories).toEqual([
			expect.objectContaining({
				hotelId: "hotel-1",
			}),
		]);
	});
});

describe("listMenuItemsForStaff", () => {
	test("rejects a user without hotel membership", async () => {
		await expect(
			listMenuItemsForStaff(
				{
					findMembershipByUserId: () => null,
					listMenuItemsByHotelId: () => [],
				},
				{ userId: "user-1" },
			),
		).rejects.toMatchObject({ code: "STAFF_MEMBERSHIP_REQUIRED" });
	});
});

describe("updateMenuItem", () => {
	test("updates item details without changing snapshots elsewhere", async () => {
		const item = await updateMenuItem(
			{
				findCategoryById: () => ({
					active: true,
					description: null,
					hotelId: "hotel-1",
					id: "cat-1",
					name: "Breakfast",
					sortOrder: 0,
				}),
				findMembershipByUserId: () => membership,
				findMenuItemById: () => ({
					available: true,
					categoryId: "cat-1",
					description: null,
					hotelId: "hotel-1",
					id: "item-1",
					imageUrl: null,
					name: "Burger",
					preparationTimeMinutes: 10,
					priceInCents: 4200,
				}),
				updateMenuItemRecord: () => undefined,
			},
			{
				itemId: "item-1",
				name: "Club Sandwich",
				priceInCents: 4500,
				userId: "user-1",
			},
		);

		expect(item.name).toBe("Club Sandwich");
		expect(item.priceInCents).toBe(4500);
	});
});

describe("toggleMenuItemAvailability", () => {
	test("toggles availability for an item in the same hotel", async () => {
		const item = await toggleMenuItemAvailability(
			{
				findMembershipByUserId: () => membership,
				findMenuItemById: () => ({
					available: true,
					categoryId: "cat-1",
					description: null,
					hotelId: "hotel-1",
					id: "item-1",
					imageUrl: null,
					name: "Burger",
					preparationTimeMinutes: 10,
					priceInCents: 4200,
				}),
				updateMenuItemRecord: () => undefined,
			},
			{
				itemId: "item-1",
				userId: "user-1",
			},
		);

		expect(item.available).toBe(false);
	});
});
