import { describe, expect, test } from "bun:test";

import { getMenuItemLoadingState } from "./staff-menu-items-state";

describe("getMenuItemLoadingState", () => {
	test("returns loading state when the pending item matches the current item", () => {
		expect(getMenuItemLoadingState("item-1", "item-1")).toEqual({
			isLoading: true,
			itemClassName: "pointer-events-none opacity-50",
			shouldShowOverlay: true,
		});
	});

	test("returns idle state when another item is pending", () => {
		expect(getMenuItemLoadingState("item-2", "item-1")).toEqual({
			isLoading: false,
			itemClassName: "",
			shouldShowOverlay: false,
		});
	});

	test("returns idle state when no item is pending", () => {
		expect(getMenuItemLoadingState(null, "item-1")).toEqual({
			isLoading: false,
			itemClassName: "",
			shouldShowOverlay: false,
		});
	});
});
