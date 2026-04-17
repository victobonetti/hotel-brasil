"use client";

import { Button } from "@finchat/ui/button";
import type { PaginationMetadata } from "@finchat/utils";
import type { Route } from "next";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { buildPageSearch } from "./pagination-state";

export function PaginationControls(props: {
	pageParam?: string;
	pagination: PaginationMetadata;
}) {
	const pathname = usePathname();
	const router = useRouter();
	const searchParams = useSearchParams();
	const pageParam = props.pageParam ?? "page";

	if (props.pagination.totalPages <= 1) {
		return null;
	}

	function goToPage(page: number) {
		const nextSearch = buildPageSearch(
			new URLSearchParams(searchParams.toString()),
			pageParam,
			page,
		);
		const href = nextSearch.length > 0 ? `${pathname}?${nextSearch}` : pathname;

		router.replace(href as Route, { scroll: false });
	}

	return (
		<div className="flex flex-wrap items-center justify-between gap-3 pt-2">
			<Button
				disabled={!props.pagination.hasPreviousPage}
				onClick={() => goToPage(props.pagination.page - 1)}
				size="sm"
				variant="outline"
			>
				Anterior
			</Button>
			<p className="text-muted-foreground text-sm">
				Pagina {props.pagination.page} de {props.pagination.totalPages}
			</p>
			<Button
				disabled={!props.pagination.hasNextPage}
				onClick={() => goToPage(props.pagination.page + 1)}
				size="sm"
				variant="outline"
			>
				Proxima
			</Button>
		</div>
	);
}
