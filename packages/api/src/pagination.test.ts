import { describe, expect, test } from "bun:test";

import {
	buildPaginationMetadata,
	normalizePage,
	paginateItems,
} from "@finchat/utils";

describe("normalizePage", () => {
	test("returns 1 for invalid values", () => {
		expect(normalizePage()).toBe(1);
		expect(normalizePage(0)).toBe(1);
		expect(normalizePage(-2)).toBe(1);
		expect(normalizePage(1.5)).toBe(1);
	});

	test("returns the provided page for positive integers", () => {
		expect(normalizePage(3)).toBe(3);
	});
});

describe("buildPaginationMetadata", () => {
	test("clamps pages below 1", () => {
		expect(
			buildPaginationMetadata({
				page: 0,
				pageSize: 10,
				totalItems: 25,
			}),
		).toMatchObject({
			hasNextPage: true,
			hasPreviousPage: false,
			page: 1,
			pageSize: 10,
			totalItems: 25,
			totalPages: 3,
		});
	});

	test("clamps pages above the last page", () => {
		expect(
			buildPaginationMetadata({
				page: 9,
				pageSize: 10,
				totalItems: 25,
			}),
		).toMatchObject({
			hasNextPage: false,
			hasPreviousPage: true,
			page: 3,
			pageSize: 10,
			totalItems: 25,
			totalPages: 3,
		});
	});

	test("keeps an empty collection on page 1 of 1", () => {
		expect(
			buildPaginationMetadata({
				page: 4,
				pageSize: 10,
				totalItems: 0,
			}),
		).toMatchObject({
			hasNextPage: false,
			hasPreviousPage: false,
			page: 1,
			pageSize: 10,
			totalItems: 0,
			totalPages: 1,
		});
	});
});

describe("paginateItems", () => {
	test("returns a paginated slice with metadata", () => {
		expect(
			paginateItems(["a", "b", "c", "d"], {
				page: 2,
				pageSize: 2,
			}),
		).toEqual({
			items: ["c", "d"],
			pagination: {
				hasNextPage: false,
				hasPreviousPage: true,
				page: 2,
				pageSize: 2,
				totalItems: 4,
				totalPages: 2,
			},
		});
	});
});
