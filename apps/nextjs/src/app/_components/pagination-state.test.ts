import { describe, expect, test } from "bun:test";

import {
	buildPageSearch,
	parsePageParam,
	shouldSyncPageParam,
} from "./pagination-state";

describe("parsePageParam", () => {
	test("normalizes invalid params to page 1", () => {
		expect(parsePageParam(undefined)).toBe(1);
		expect(parsePageParam("0")).toBe(1);
		expect(parsePageParam("-3")).toBe(1);
		expect(parsePageParam(["abc"])).toBe(1);
	});

	test("returns positive integer params", () => {
		expect(parsePageParam("3")).toBe(3);
	});
});

describe("buildPageSearch", () => {
	test("preserves unrelated params and updates the requested page param", () => {
		expect(
			buildPageSearch(new URLSearchParams("orderId=ord-1&page=2"), "page", 3),
		).toBe("orderId=ord-1&page=3");
	});

	test("updates only the targeted page param when multiple paginations share the url", () => {
		expect(
			buildPageSearch(
				new URLSearchParams("activePage=2&historyPage=4&orderId=ord-1"),
				"historyPage",
				3,
			),
		).toBe("activePage=2&historyPage=3&orderId=ord-1");
	});

	test("removes the page param when returning to the first page", () => {
		expect(buildPageSearch(new URLSearchParams("page=2"), "page", 1)).toBe("");
	});
});

describe("shouldSyncPageParam", () => {
	test("returns true when the resolved backend page differs from the url", () => {
		expect(
			shouldSyncPageParam(9, {
				hasNextPage: false,
				hasPreviousPage: true,
				page: 2,
				pageSize: 10,
				totalItems: 11,
				totalPages: 2,
			}),
		).toBe(true);
	});

	test("returns false when pagination is already aligned", () => {
		expect(
			shouldSyncPageParam(2, {
				hasNextPage: false,
				hasPreviousPage: true,
				page: 2,
				pageSize: 10,
				totalItems: 11,
				totalPages: 2,
			}),
		).toBe(false);
	});
});
