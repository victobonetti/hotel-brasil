import type { PaginationMetadata } from "@finchat/utils";

export function parsePageParam(value: string | Array<string> | undefined) {
	const pageValue = Array.isArray(value) ? Number(value[0]) : Number(value);

	if (!pageValue || !Number.isInteger(pageValue) || pageValue < 1) {
		return 1;
	}

	return pageValue;
}

export function buildPageSearch(
	searchParams: URLSearchParams,
	pageParam: string,
	page: number,
) {
	const nextSearchParams = new URLSearchParams(searchParams);

	if (page <= 1) {
		nextSearchParams.delete(pageParam);
	} else {
		nextSearchParams.set(pageParam, String(page));
	}

	return nextSearchParams.toString();
}

export function shouldSyncPageParam(
	currentPage: number,
	pagination: PaginationMetadata | undefined,
) {
	if (!pagination) {
		return false;
	}

	return currentPage !== pagination.page;
}
