import { describe, expect, test } from "bun:test";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";

import {
	buildPaginationWindow,
	PaginationControlsView,
} from "./pagination-controls";

describe("buildPaginationWindow", () => {
	test("keeps the current page centered when possible", () => {
		expect(
			buildPaginationWindow({
				hasNextPage: true,
				hasPreviousPage: true,
				page: 5,
				pageSize: 10,
				totalItems: 100,
				totalPages: 10,
			}),
		).toEqual({
			endPage: 7,
			pages: [3, 4, 5, 6, 7],
			showLeadingEllipsis: true,
			showTrailingEllipsis: true,
			startPage: 3,
		});
	});

	test("collapses to the full range when there are only a few pages", () => {
		expect(
			buildPaginationWindow({
				hasNextPage: true,
				hasPreviousPage: false,
				page: 1,
				pageSize: 10,
				totalItems: 24,
				totalPages: 3,
			}),
		).toEqual({
			endPage: 3,
			pages: [1, 2, 3],
			showLeadingEllipsis: false,
			showTrailingEllipsis: false,
			startPage: 1,
		});
	});
});

describe("PaginationControlsView", () => {
	test("renders the current page, total items and numbered navigation", () => {
		const html = renderToStaticMarkup(
			createElement(PaginationControlsView, {
				onPageChange: () => undefined,
				pagination: {
					hasNextPage: true,
					hasPreviousPage: true,
					page: 2,
					pageSize: 10,
					totalItems: 25,
					totalPages: 3,
				},
			}),
		);

		expect(html).toContain("Pagina 2 de 3");
		expect(html).toContain("25 itens");
		expect(html).toContain("Anterior");
		expect(html).toContain("Proxima");
		expect(html).toContain('aria-current="page"');
	});
});
