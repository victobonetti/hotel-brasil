export interface PaginationInput {
	page?: number;
	pageSize: number;
}

export const PAGE_SIZES = {
	categoryDetailsHistory: 6,
	categoryDetailsItems: 5,
	guestMenuCategories: 6,
	guestMenuCategoryItems: 6,
	guestOrdersActive: 4,
	guestOrdersHistory: 6,
	staffCategories: 10,
	staffCategoryOptions: 1000,
	staffMenuItems: 12,
	staffOperationalOrders: 8,
	staffRooms: 10,
} as const;

export interface PaginationMetadata {
	hasNextPage: boolean;
	hasPreviousPage: boolean;
	page: number;
	pageSize: number;
	totalItems: number;
	totalPages: number;
}

export interface PaginatedResult<TItem> {
	items: Array<TItem>;
	pagination: PaginationMetadata;
}

export function normalizePage(page?: number | null) {
	if (!page || !Number.isInteger(page) || page < 1) {
		return 1;
	}

	return page;
}

export function buildPaginationMetadata(
	input: PaginationInput & { totalItems: number },
) {
	const totalPages = Math.max(1, Math.ceil(input.totalItems / input.pageSize));
	const page = Math.min(normalizePage(input.page), totalPages);

	return {
		hasNextPage: page < totalPages,
		hasPreviousPage: page > 1,
		page,
		pageSize: input.pageSize,
		totalItems: input.totalItems,
		totalPages,
	} satisfies PaginationMetadata;
}

export function paginateItems<TItem>(
	items: Array<TItem>,
	input: PaginationInput,
): PaginatedResult<TItem> {
	const pagination = buildPaginationMetadata({
		page: input.page,
		pageSize: input.pageSize,
		totalItems: items.length,
	});
	const startIndex = (pagination.page - 1) * pagination.pageSize;

	return {
		items: items.slice(startIndex, startIndex + pagination.pageSize),
		pagination,
	};
}
