"use client";

import { Button } from "@finchat/ui/button";
import type { PaginationMetadata } from "@finchat/utils";
import type { Route } from "next";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { buildPageSearch } from "./pagination-state";

export function buildPaginationWindow(
	pagination: PaginationMetadata,
	maxVisiblePages = 5,
) {
	const visiblePages = Math.max(1, maxVisiblePages);

	if (pagination.totalPages <= visiblePages) {
		return {
			endPage: pagination.totalPages,
			pages: Array.from(
				{ length: pagination.totalPages },
				(_, index) => index + 1,
			),
			showLeadingEllipsis: false,
			showTrailingEllipsis: false,
			startPage: 1,
		};
	}

	const halfWindow = Math.floor(visiblePages / 2);
	let startPage = Math.max(1, pagination.page - halfWindow);
	let endPage = startPage + visiblePages - 1;

	if (endPage > pagination.totalPages) {
		endPage = pagination.totalPages;
		startPage = Math.max(1, endPage - visiblePages + 1);
	}

	return {
		endPage,
		pages: Array.from(
			{ length: endPage - startPage + 1 },
			(_, index) => startPage + index,
		),
		showLeadingEllipsis: startPage > 1,
		showTrailingEllipsis: endPage < pagination.totalPages,
		startPage,
	};
}

function formatTotalItemsLabel(totalItems: number) {
	return `${totalItems} ${totalItems === 1 ? "item" : "itens"}`;
}

export function PaginationControlsView(props: {
	onPageChange: (page: number) => void;
	pageParam?: string;
	pagination: PaginationMetadata;
}) {
	const { pagination } = props;

	if (pagination.totalPages <= 1) {
		return null;
	}

	const paginationWindow = buildPaginationWindow(pagination);

	return (
		<div className="space-y-3 rounded-2xl border border-primary/10 bg-background/80 p-3">
			<div className="flex flex-wrap items-center justify-between gap-2">
				<p className="font-medium text-sm">
					Pagina {pagination.page} de {pagination.totalPages}
				</p>
				<p className="text-muted-foreground text-sm">
					{formatTotalItemsLabel(pagination.totalItems)}
				</p>
			</div>
			<div className="flex flex-wrap items-center justify-between gap-2">
				<Button
					disabled={!pagination.hasPreviousPage}
					onClick={() => props.onPageChange(pagination.page - 1)}
					size="sm"
					variant="outline"
				>
					Anterior
				</Button>
				<div className="flex flex-1 flex-wrap items-center justify-center gap-2">
					{paginationWindow.showLeadingEllipsis ? (
						<>
							<Button
								onClick={() => props.onPageChange(1)}
								size="sm"
								variant="outline"
							>
								1
							</Button>
							<span className="text-muted-foreground text-sm">...</span>
						</>
					) : null}
					{paginationWindow.pages.map((page) => (
						<Button
							aria-current={page === pagination.page ? "page" : undefined}
							key={page}
							onClick={() => props.onPageChange(page)}
							size="sm"
							variant={page === pagination.page ? "default" : "outline"}
						>
							{page}
						</Button>
					))}
					{paginationWindow.showTrailingEllipsis ? (
						<>
							<span className="text-muted-foreground text-sm">...</span>
							<Button
								onClick={() => props.onPageChange(pagination.totalPages)}
								size="sm"
								variant="outline"
							>
								{pagination.totalPages}
							</Button>
						</>
					) : null}
				</div>
				<Button
					disabled={!pagination.hasNextPage}
					onClick={() => props.onPageChange(pagination.page + 1)}
					size="sm"
					variant="outline"
				>
					Proxima
				</Button>
			</div>
		</div>
	);
}

export function PaginationControls(props: {
	pageParam?: string;
	pagination: PaginationMetadata;
}) {
	const pathname = usePathname();
	const router = useRouter();
	const searchParams = useSearchParams();
	const pageParam = props.pageParam ?? "page";

	function goToPage(page: number) {
		const nextSearch = buildPageSearch(
			new URLSearchParams(searchParams.toString()),
			pageParam,
			page,
		);
		const href = nextSearch.length > 0 ? `${pathname}?${nextSearch}` : pathname;

		router.replace(href as Route, { scroll: false });
	}

	return <PaginationControlsView {...props} onPageChange={goToPage} />;
}
