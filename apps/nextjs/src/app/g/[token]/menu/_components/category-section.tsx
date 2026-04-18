"use client";

import type { MenuCategoryWithItems } from "@finchat/api";
import type { Route } from "next";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";

import { PaginationControls } from "~/app/_components/pagination-controls";
import {
	buildPageSearch,
	parsePageParam,
	shouldSyncPageParam,
} from "~/app/_components/pagination-state";

import { MenuItemCard } from "./menu-item-card";
import {
	buildCategoryItemsPageParam,
	paginateCategoryItems,
} from "./category-section-state";

export function CategorySection(props: {
	category: MenuCategoryWithItems;
	onSelectItem: (item: MenuCategoryWithItems["items"][number]) => void;
}) {
	const pathname = usePathname();
	const router = useRouter();
	const searchParams = useSearchParams();
	const pageParam = buildCategoryItemsPageParam(props.category.id);
	const currentPage = parsePageParam(searchParams.get(pageParam) ?? undefined);
	const paginatedItems = paginateCategoryItems(props.category.items, currentPage);

	useEffect(() => {
		if (!shouldSyncPageParam(currentPage, paginatedItems.pagination)) {
			return;
		}

		const nextSearch = buildPageSearch(
			new URLSearchParams(searchParams.toString()),
			pageParam,
			paginatedItems.pagination.page,
		);
		router.replace(
			(nextSearch.length > 0 ? `${pathname}?${nextSearch}` : pathname) as Route,
			{
				scroll: false,
			},
		);
	}, [
		currentPage,
		pageParam,
		paginatedItems.pagination,
		pathname,
		router,
		searchParams,
	]);

	return (
		<section className="space-y-4">
			<div className="flex items-end justify-between gap-3">
				<div className="space-y-2">
					<div className="inline-flex rounded-full bg-[#fff1ee] px-3 py-1 font-medium text-[#b42318] text-xs uppercase tracking-[0.22em]">
						Categoria
					</div>
					<div className="space-y-1">
						<h2 className="font-semibold text-2xl tracking-tight sm:text-3xl">
							{props.category.name}
						</h2>
						{props.category.description ? (
							<p className="max-w-2xl text-muted-foreground text-sm sm:text-base">
								{props.category.description}
							</p>
						) : null}
					</div>
				</div>
				<div className="rounded-full border border-[#f0d5d2] bg-white/90 px-3 py-1 font-medium text-[#b42318] text-xs shadow-sm">
					{props.category.items.length} item(ns)
				</div>
			</div>

			{props.category.items.length > 0 ? (
				<div className="space-y-4">
					<div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
						{paginatedItems.items.map((item) => (
							<MenuItemCard
								item={item}
								key={item.id}
								onSelect={props.onSelectItem}
							/>
						))}
					</div>
					<PaginationControls
						pageParam={pageParam}
						pagination={paginatedItems.pagination}
					/>
				</div>
			) : (
				<div className="rounded-[24px] border border-[#f0d5d2] border-dashed bg-white/84 px-5 py-6 text-muted-foreground text-sm backdrop-blur">
					Nao ha itens disponiveis nesta categoria no momento.
				</div>
			)}
		</section>
	);
}
