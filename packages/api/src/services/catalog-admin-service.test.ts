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

	test("stores a processed image data url when provided", async () => {
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
				imageUrl: "data:image/webp;base64,Zm9v",
				name: "Burger",
				priceInCents: 4200,
				userId: "user-1",
			},
		);

		expect(item.imageUrl).toBe("data:image/webp;base64,Zm9v");
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

	test("rejects oversized image payloads", async () => {
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
					imageUrl: `data:image/webp;base64,${"a".repeat(250_000)}`,
					name: "Burger",
					priceInCents: 4200,
					userId: "user-1",
				},
			),
		).rejects.toMatchObject({ code: "INVALID_IMAGE" });
	});
});

describe("listCategoriesForStaff", () => {
	test("returns a paginated category response for the staff hotel", async () => {
		const records = Array.from({ length: 11 }, (_, index) => ({
			active: true,
			description: null,
			hotelId: "hotel-1",
			id: `cat-${index + 1}`,
			name: `Category ${index + 1}`,
			sortOrder: index,
		}));
		const categories = await listCategoriesForStaff(
			{
				countCategoriesByHotelId: () => records.length,
				findMembershipByUserId: () => membership,
				listCategoriesByHotelId: (_hotelId, input) =>
					records.slice(input.offset, input.offset + input.limit),
			},
			{ page: 2, pageSize: 10, userId: "user-1" },
		);

		expect(categories.items).toEqual([
			expect.objectContaining({
				hotelId: "hotel-1",
				id: "cat-11",
			}),
		]);
		expect(categories.pagination).toMatchObject({
			hasNextPage: false,
			hasPreviousPage: true,
			page: 2,
			pageSize: 10,
			totalItems: 11,
			totalPages: 2,
		});
	});

	test("clamps invalid pages to the available range", async () => {
		const records = Array.from({ length: 3 }, (_, index) => ({
			active: true,
			description: null,
			hotelId: "hotel-1",
			id: `cat-${index + 1}`,
			name: `Category ${index + 1}`,
			sortOrder: index,
		}));

		const categories = await listCategoriesForStaff(
			{
				countCategoriesByHotelId: () => records.length,
				findMembershipByUserId: () => membership,
				listCategoriesByHotelId: (_hotelId, input) =>
					records.slice(input.offset, input.offset + input.limit),
			},
			{ page: 99, pageSize: 2, userId: "user-1" },
		);

		expect(categories.items.map((category) => category.id)).toEqual(["cat-3"]);
		expect(categories.pagination.page).toBe(2);
	});
});

describe("listMenuItemsForStaff", () => {
	test("returns a paginated response with normalized metadata", async () => {
		const records = Array.from({ length: 13 }, (_, index) => ({
			available: true,
			categoryId: "cat-1",
			description: null,
			hotelId: "hotel-1",
			id: `item-${index + 1}`,
			imageUrl: null,
			name: `Item ${index + 1}`,
			preparationTimeMinutes: 10,
			priceInCents: 1000 + index,
		}));

		const items = await listMenuItemsForStaff(
			{
				countMenuItemsByHotelId: () => records.length,
				findMembershipByUserId: () => membership,
				listMenuItemsByHotelId: (_hotelId, input) =>
					records.slice(input.offset, input.offset + input.limit),
			},
			{ page: 0, pageSize: 12, userId: "user-1" },
		);

		expect(items.items).toHaveLength(12);
		expect(items.pagination).toMatchObject({
			hasNextPage: true,
			hasPreviousPage: false,
			page: 1,
			pageSize: 12,
			totalItems: 13,
			totalPages: 2,
		});
	});

	test("rejects a user without hotel membership", async () => {
		await expect(
			listMenuItemsForStaff(
				{
					countMenuItemsByHotelId: () => 0,
					findMembershipByUserId: () => null,
					listMenuItemsByHotelId: () => [],
				},
				{ page: 1, pageSize: 12, userId: "user-1" },
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

	test("updates item image when a processed data url is provided", async () => {
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
				imageUrl: "data:image/webp;base64,Zm9v",
				itemId: "item-1",
				userId: "user-1",
			},
		);

		expect(item.imageUrl).toBe("data:image/webp;base64,Zm9v");
	});

	test("removes item image when an empty string is provided", async () => {
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
					imageUrl: "data:image/webp;base64,Zm9v",
					name: "Burger",
					preparationTimeMinutes: 10,
					priceInCents: 4200,
				}),
				updateMenuItemRecord: () => undefined,
			},
			{
				imageUrl: "",
				itemId: "item-1",
				userId: "user-1",
			},
		);

		expect(item.imageUrl).toBeNull();
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
