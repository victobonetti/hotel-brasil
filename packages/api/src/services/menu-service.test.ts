import { describe, expect, test } from "bun:test";

import {
	getMenuForGuestSession,
	listAvailableItems,
	listCategoriesByHotel,
	MenuServiceError,
} from "./menu-service";

const baseCategories = [
	{
		active: true,
		description: "Cafes e bebidas",
		hotelId: "hotel-a",
		id: "cat-breakfast",
		name: "Breakfast",
		sortOrder: 2,
	},
	{
		active: true,
		description: "Pratos principais",
		hotelId: "hotel-a",
		id: "cat-lunch",
		name: "Lunch",
		sortOrder: 1,
	},
	{
		active: true,
		description: "Outro hotel",
		hotelId: "hotel-b",
		id: "cat-other-hotel",
		name: "Other Hotel",
		sortOrder: 1,
	},
];

const baseItems = [
	{
		available: true,
		categoryId: "cat-lunch",
		description: "Suco natural",
		hotelId: "hotel-a",
		id: "item-juice",
		imageUrl: null,
		name: "Apple Juice",
		preparationTimeMinutes: 5,
		priceInCents: 1800,
	},
	{
		available: true,
		categoryId: "cat-lunch",
		description: "Sanduiche",
		hotelId: "hotel-a",
		id: "item-sandwich",
		imageUrl: null,
		name: "Club Sandwich",
		preparationTimeMinutes: 15,
		priceInCents: 4200,
	},
	{
		available: false,
		categoryId: "cat-lunch",
		description: "Indisponivel",
		hotelId: "hotel-a",
		id: "item-hidden",
		imageUrl: null,
		name: "Hidden Dish",
		preparationTimeMinutes: 15,
		priceInCents: 5000,
	},
	{
		available: true,
		categoryId: "cat-other-hotel",
		description: "Outro hotel",
		hotelId: "hotel-b",
		id: "item-other-hotel",
		imageUrl: null,
		name: "Other Hotel Item",
		preparationTimeMinutes: 15,
		priceInCents: 5100,
	},
	{
		available: true,
		categoryId: "missing-category",
		description: "Sem categoria valida",
		hotelId: "hotel-a",
		id: "item-orphan",
		imageUrl: null,
		name: "Orphan Item",
		preparationTimeMinutes: 10,
		priceInCents: 2300,
	},
];

describe("listCategoriesByHotel", () => {
	test("returns only active categories for the requested hotel ordered by sortOrder and name", () => {
		expect(
			listCategoriesByHotel(
				[
					...baseCategories,
					{
						active: false,
						description: null,
						hotelId: "hotel-a",
						id: "cat-inactive",
						name: "Inactive",
						sortOrder: 0,
					},
				],
				"hotel-a",
			).map((category) => category.id),
		).toEqual(["cat-lunch", "cat-breakfast"]);
	});
});

describe("listAvailableItems", () => {
	test("orders items correctly by name", () => {
		expect(
			listAvailableItems(baseItems, "hotel-a", ["cat-lunch"]).map((item) => item.id),
		).toEqual(["item-juice", "item-sandwich"]);
	});

	test("excludes items without a valid category when integrity is enforced", () => {
		expect(
			listAvailableItems(baseItems, "hotel-a", ["cat-lunch"]).some(
				(item) => item.id === "item-orphan",
			),
		).toBe(false);
	});

	test("respects the provided hotelId", () => {
		expect(
			listAvailableItems(baseItems, "hotel-b", ["cat-other-hotel"]).map(
				(item) => item.id,
			),
		).toEqual(["item-other-hotel"]);
	});
});

describe("getMenuForGuestSession", () => {
	test("returns only categories from the guest session hotel", async () => {
		const menu = await getMenuForGuestSession(
			{
				findGuestSessionByToken: () => ({
					expiresAt: new Date("2026-04-16T00:00:00.000Z"),
					hotelId: "hotel-a",
					id: "session-1",
					roomId: "room-101",
					token: "valid",
				}),
				listCategoriesByHotel: () => baseCategories,
				listItemsByHotel: () => baseItems,
				now: () => new Date("2026-04-15T00:00:00.000Z"),
			},
			{ guestSessionToken: "valid" },
		);

		expect(menu.categories.map((category) => category.id)).toEqual([
			"cat-lunch",
			"cat-breakfast",
		]);
	});

	test("returns only available items", async () => {
		const menu = await getMenuForGuestSession(
			{
				findGuestSessionByToken: () => ({
					expiresAt: new Date("2026-04-16T00:00:00.000Z"),
					hotelId: "hotel-a",
					id: "session-1",
					roomId: "room-101",
					token: "valid",
				}),
				listCategoriesByHotel: () => baseCategories,
				listItemsByHotel: () => baseItems,
				now: () => new Date("2026-04-15T00:00:00.000Z"),
			},
			{ guestSessionToken: "valid" },
		);

		expect(menu.categories.flatMap((category) => category.items).map((item) => item.id))
			.toEqual(["item-juice", "item-sandwich"]);
	});

	test("does not return items from another hotel", async () => {
		const menu = await getMenuForGuestSession(
			{
				findGuestSessionByToken: () => ({
					expiresAt: new Date("2026-04-16T00:00:00.000Z"),
					hotelId: "hotel-a",
					id: "session-1",
					roomId: "room-101",
					token: "valid",
				}),
				listCategoriesByHotel: () => baseCategories,
				listItemsByHotel: () => baseItems,
				now: () => new Date("2026-04-15T00:00:00.000Z"),
			},
			{ guestSessionToken: "valid" },
		);

		expect(menu.categories.flatMap((category) => category.items)).not.toContainEqual(
			expect.objectContaining({ id: "item-other-hotel" }),
		);
	});

	test("fails when the session is expired", async () => {
		await expect(
			getMenuForGuestSession(
				{
					findGuestSessionByToken: () => ({
						expiresAt: new Date("2026-04-14T00:00:00.000Z"),
						hotelId: "hotel-a",
						id: "session-1",
						roomId: "room-101",
						token: "expired",
					}),
					listCategoriesByHotel: () => baseCategories,
					listItemsByHotel: () => baseItems,
					now: () => new Date("2026-04-15T00:00:00.000Z"),
				},
				{ guestSessionToken: "expired" },
			),
		).rejects.toMatchObject({
			code: "GUEST_SESSION_EXPIRED",
		} satisfies Partial<MenuServiceError>);
	});

	test("fails when the token is invalid", async () => {
		await expect(
			getMenuForGuestSession(
				{
					findGuestSessionByToken: () => null,
					listCategoriesByHotel: () => baseCategories,
					listItemsByHotel: () => baseItems,
				},
				{ guestSessionToken: "invalid" },
			),
		).rejects.toMatchObject({
			code: "GUEST_SESSION_NOT_FOUND",
		} satisfies Partial<MenuServiceError>);
	});
});
