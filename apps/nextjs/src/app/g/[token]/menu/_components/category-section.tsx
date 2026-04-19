"use client";

import type { MenuCategoryWithItems } from "@nowait24/api";
import type { Route } from "next";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";

import { PaginationControls } from "~/app/_components/pagination-controls";
import {
	buildPageSearch,
	parsePageParam,
	shouldSyncPageParam,
} from "~/app/_components/pagination-state";
import {
	buildCategoryItemsPageParam,
	paginateCategoryItems,
} from "./category-section-state";
import { MenuItemCard } from "./menu-item-card";

export function CategorySection(props: {
	category: MenuCategoryWithItems;
	onSelectItem: (item: MenuCategoryWithItems["items"][number]) => void;
}) {
	const pathname = usePathname();
	const router = useRouter();
	const searchParams = useSearchParams();
	const pageParam = buildCategoryItemsPageParam(props.category.id);
	const currentPage = parsePageParam(searchParams.get(pageParam) ?? undefined);
	const paginatedItems = paginateCategoryItems(
		props.category.items,
		currentPage,
	);

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
		<section className="space-y-4 rounded-[30px] border border-[#efe0da] bg-[linear-gradient(180deg,#fffdfb_0%,#fff8f4_100%)] p-4 shadow-[0_26px_60px_-48px_rgba(86,59,52,0.24)] sm:p-5">
			<div className="flex items-start justify-between gap-3">
				<div className="space-y-1">
					<h2 className="font-semibold text-2xl text-[#2c1b19] tracking-tight">
						{props.category.name}
					</h2>
					{props.category.description ? (
						<p className="max-w-2xl text-[#7d6660] text-sm leading-6">
							{props.category.description}
						</p>
					) : null}
				</div>
				<div className="self-start rounded-full border border-[#f0d8d0] bg-white px-3 py-1 font-medium text-[#b15a45] text-xs shadow-[0_14px_28px_-24px_rgba(86,59,52,0.2)]">
					{props.category.items.length} item(ns)
				</div>
			</div>

			{props.category.items.length > 0 ? (
				<div className="space-y-4">
					<div className="grid gap-3 md:grid-cols-2">
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
				<div className="rounded-[24px] border border-[#ecd8d2] border-dashed bg-white px-5 py-6 text-[#7d6660] text-sm">
					Nao ha itens disponiveis nesta categoria no momento.
				</div>
			)}
		</section>
	);
}
