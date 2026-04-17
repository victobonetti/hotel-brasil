"use client";

import { Button } from "@finchat/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@finchat/ui/card";
import { PAGE_SIZES, paginateItems } from "@finchat/utils";
import { useQuery } from "@tanstack/react-query";
import type { Route } from "next";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";

import { PaginationControls } from "~/app/_components/pagination-controls";
import {
	buildPageSearch,
	parsePageParam,
	shouldSyncPageParam,
} from "~/app/_components/pagination-state";
import { useTRPC } from "~/trpc/react";
import { OrderActionButtons } from "./order-action-buttons";

export function OrderDetailsDrawer(props: {
	onRefresh?: () => void;
	orderId: string | null;
}) {
	const trpc = useTRPC();
	const pathname = usePathname();
	const router = useRouter();
	const searchParams = useSearchParams();
	const itemsPage = parsePageParam(
		searchParams.get("detailsItemsPage") ?? undefined,
	);
	const historyPage = parsePageParam(
		searchParams.get("detailsHistoryPage") ?? undefined,
	);
	const orderDetailsQuery = useQuery({
		...trpc.staffOrder.getOrderDetails.queryOptions({
			orderId: props.orderId ?? "",
		}),
		enabled: Boolean(props.orderId),
	});

	const paginatedItems = paginateItems(orderDetailsQuery.data?.items ?? [], {
		page: itemsPage,
		pageSize: PAGE_SIZES.categoryDetailsItems,
	});
	const paginatedHistory = paginateItems(
		orderDetailsQuery.data?.statusHistory ?? [],
		{
			page: historyPage,
			pageSize: PAGE_SIZES.categoryDetailsHistory,
		},
	);

	useEffect(() => {
		if (!shouldSyncPageParam(itemsPage, paginatedItems.pagination)) {
			return;
		}

		const nextSearch = buildPageSearch(
			new URLSearchParams(searchParams.toString()),
			"detailsItemsPage",
			paginatedItems.pagination.page,
		);
		router.replace(
			(nextSearch.length > 0 ? `${pathname}?${nextSearch}` : pathname) as Route,
			{
				scroll: false,
			},
		);
	}, [itemsPage, paginatedItems.pagination, pathname, router, searchParams]);

	useEffect(() => {
		if (!shouldSyncPageParam(historyPage, paginatedHistory.pagination)) {
			return;
		}

		const nextSearch = buildPageSearch(
			new URLSearchParams(searchParams.toString()),
			"detailsHistoryPage",
			paginatedHistory.pagination.page,
		);
		router.replace(
			(nextSearch.length > 0 ? `${pathname}?${nextSearch}` : pathname) as Route,
			{
				scroll: false,
			},
		);
	}, [
		historyPage,
		paginatedHistory.pagination,
		pathname,
		router,
		searchParams,
	]);

	if (!props.orderId) {
		return (
			<Card className="border-primary/15 bg-card/88 shadow-primary/10 shadow-sm">
				<CardHeader>
					<CardTitle>Detalhes do pedido</CardTitle>
					<CardDescription>
						Selecione um pedido da fila para ver itens, historico e acoes.
					</CardDescription>
				</CardHeader>
			</Card>
		);
	}

	if (orderDetailsQuery.isLoading) {
		return (
			<Card className="border-primary/15 bg-card/88 shadow-primary/10 shadow-sm">
				<CardHeader>
					<CardTitle>Carregando pedido</CardTitle>
				</CardHeader>
			</Card>
		);
	}

	if (orderDetailsQuery.error || !orderDetailsQuery.data) {
		return (
			<Card className="border-destructive/20 bg-destructive/5">
				<CardHeader>
					<CardTitle>Pedido indisponivel</CardTitle>
					<CardDescription>
						{orderDetailsQuery.error?.message ??
							"Nao foi possivel carregar esse pedido."}
					</CardDescription>
				</CardHeader>
			</Card>
		);
	}

	return (
		<Card className="border-primary/15 bg-card/88 shadow-primary/10 shadow-sm">
			<CardHeader className="border-border/60 border-b">
				<div className="space-y-1">
					<CardTitle>Pedido {orderDetailsQuery.data.id}</CardTitle>
					<CardDescription>
						Quarto{" "}
						{orderDetailsQuery.data.room?.label ??
							orderDetailsQuery.data.roomId}{" "}
						- status atual {orderDetailsQuery.data.status}
					</CardDescription>
				</div>
			</CardHeader>
			<CardContent className="space-y-5 pt-6">
				<div className="space-y-3">
					{paginatedItems.items.map((item) => (
						<div
							className="rounded-2xl border border-primary/10 bg-primary/[0.03] p-4"
							key={item.id}
						>
							<p className="font-medium">
								{item.quantity}x {item.itemNameSnapshot}
							</p>
							{item.notes ? (
								<p className="text-muted-foreground text-sm">{item.notes}</p>
							) : null}
						</div>
					))}
					<PaginationControls
						pageParam="detailsItemsPage"
						pagination={paginatedItems.pagination}
					/>
				</div>

				<OrderActionButtons
					onSuccess={props.onRefresh}
					orderId={orderDetailsQuery.data.id}
					status={orderDetailsQuery.data.status}
				/>

				<div className="space-y-2">
					<p className="font-medium text-primary text-sm">Historico</p>
					<div className="space-y-2">
						{paginatedHistory.items.map((entry) => (
							<div
								className="rounded-xl border border-primary/10 bg-background/80 px-3 py-2 text-sm"
								key={entry.id}
							>
								{entry.toStatus}
							</div>
						))}
					</div>
					<PaginationControls
						pageParam="detailsHistoryPage"
						pagination={paginatedHistory.pagination}
					/>
				</div>

				<Button onClick={props.onRefresh} variant="outline">
					Atualizar fila
				</Button>
			</CardContent>
		</Card>
	);
}
