"use client";

import { PAGE_SIZES, paginateItems } from "@nowait24/utils";
import { useQuery } from "@tanstack/react-query";
import type { Route } from "next";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";

import {
	buildPageSearch,
	parsePageParam,
	shouldSyncPageParam,
} from "~/app/_components/pagination-state";
import { useTRPC } from "~/trpc/react";
import { partitionGuestOrders } from "./guest-orders-display";
import { GuestOrdersPageView } from "./guest-orders-page-view";

export function GuestOrdersPage(props: { guestSessionToken: string }) {
	const trpc = useTRPC();
	const pathname = usePathname();
	const router = useRouter();
	const searchParams = useSearchParams();
	const activePage = parsePageParam(searchParams.get("activePage") ?? undefined);
	const historyPage = parsePageParam(
		searchParams.get("historyPage") ?? undefined,
	);
	const ordersQuery = useQuery({
		...trpc.order.listGuestOrders.queryOptions({
			guestSessionToken: props.guestSessionToken,
		}),
		refetchInterval: (query) => {
			const data = query.state.data ?? [];
			const { activeOrders } = partitionGuestOrders(data);

			return activeOrders.length > 0 ? 5000 : false;
		},
	});

	const sections = partitionGuestOrders(ordersQuery.data ?? []);
	const paginatedActiveOrders = paginateItems(sections.activeOrders, {
		page: activePage,
		pageSize: PAGE_SIZES.guestOrdersActive,
	});
	const paginatedHistoryOrders = paginateItems(sections.historyOrders, {
		page: historyPage,
		pageSize: PAGE_SIZES.guestOrdersHistory,
	});

	useEffect(() => {
		if (
			!shouldSyncPageParam(activePage, paginatedActiveOrders.pagination)
		) {
			return;
		}

		const nextSearch = buildPageSearch(
			new URLSearchParams(searchParams.toString()),
			"activePage",
			paginatedActiveOrders.pagination.page,
		);
		router.replace(
			(nextSearch.length > 0 ? `${pathname}?${nextSearch}` : pathname) as Route,
			{
				scroll: false,
			},
		);
	}, [
		activePage,
		paginatedActiveOrders.pagination,
		pathname,
		router,
		searchParams,
	]);

	useEffect(() => {
		if (
			!shouldSyncPageParam(historyPage, paginatedHistoryOrders.pagination)
		) {
			return;
		}

		const nextSearch = buildPageSearch(
			new URLSearchParams(searchParams.toString()),
			"historyPage",
			paginatedHistoryOrders.pagination.page,
		);
		router.replace(
			(nextSearch.length > 0 ? `${pathname}?${nextSearch}` : pathname) as Route,
			{
				scroll: false,
			},
		);
	}, [
		historyPage,
		paginatedHistoryOrders.pagination,
		pathname,
		router,
		searchParams,
	]);

	if (ordersQuery.isLoading) {
		return (
			<main className="mx-auto flex min-h-screen max-w-5xl items-center px-4 py-10">
				<p className="text-muted-foreground text-sm">
					Carregando seus pedidos...
				</p>
			</main>
		);
	}

	if (ordersQuery.error) {
		return (
			<main className="mx-auto flex min-h-screen max-w-5xl items-center px-4 py-10">
				<p className="text-destructive text-sm">{ordersQuery.error.message}</p>
			</main>
		);
	}

	return (
		<GuestOrdersPageView
			activeOrders={paginatedActiveOrders.items}
			activePagination={paginatedActiveOrders.pagination}
			activeTotal={sections.activeOrders.length}
			guestSessionToken={props.guestSessionToken}
			hasActiveOrders={sections.activeOrders.length > 0}
			hasHistoryOrders={sections.historyOrders.length > 0}
			historyOrders={paginatedHistoryOrders.items}
			historyPagination={paginatedHistoryOrders.pagination}
			historyTotal={sections.historyOrders.length}
		/>
	);
}
