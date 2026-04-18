import { describe, expect, test } from "bun:test";

import {
	buildCategoryItemsPageParam,
	paginateCategoryItems,
} from "./category-section-state";

describe("buildCategoryItemsPageParam", () => {
	test("creates a stable query param for each category", () => {
		expect(buildCategoryItemsPageParam("cat-breakfast")).toBe(
			"categoryPage_cat-breakfast",
		);
	});
});

describe("paginateCategoryItems", () => {
	test("returns the requested slice using the guest category page size", () => {
		const result = paginateCategoryItems(
			Array.from({ length: 8 }, (_, index) => ({
				description: null,
				id: `item-${index + 1}`,
				imageUrl: null,
				name: `Item ${index + 1}`,
				preparationTimeMinutes: 15,
				priceInCents: 1000 + index,
			})),
			2,
		);

		expect(result.items.map((item) => item.id)).toEqual([
			"item-7",
			"item-8",
		]);
		expect(result.pagination).toMatchObject({
			hasNextPage: false,
			hasPreviousPage: true,
			page: 2,
			pageSize: 6,
			totalItems: 8,
			totalPages: 2,
		});
	});
});
