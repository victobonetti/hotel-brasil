import type { MenuCategoryWithItems } from "@finchat/api";
import { PAGE_SIZES, paginateItems } from "@finchat/utils/pagination";

export function buildCategoryItemsPageParam(categoryId: string) {
	return `categoryPage_${categoryId}`;
}

export function paginateCategoryItems(
	items: MenuCategoryWithItems["items"],
	page?: number,
) {
	return paginateItems(items, {
		page,
		pageSize: PAGE_SIZES.guestMenuCategoryItems,
	});
}
