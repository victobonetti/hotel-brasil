"use client";

import { Badge } from "@nowait24/ui/badge";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@nowait24/ui/card";
import { PAGE_SIZES, paginateItems } from "@nowait24/utils";
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
import {
	buildStaffOrderHistoryLabel,
	getStaffOrderDisplayMeta,
} from "./staff-order-display";

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
						Selecione um pedido da fila ou do historico para ver itens,
						andamento e acoes.
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

	const orderDisplay = getStaffOrderDisplayMeta({
		orderId: orderDetailsQuery.data.id,
		placedAt: orderDetailsQuery.data.placedAt,
		roomId: orderDetailsQuery.data.roomId,
		roomLabel: orderDetailsQuery.data.room?.label,
		status: orderDetailsQuery.data.status,
	});

	return (
		<Card className="border-primary/15 bg-card/88 shadow-primary/10 shadow-sm">
			<CardHeader className="border-border/60 border-b">
				<div className="space-y-3">
					<div className="flex flex-wrap items-start justify-between gap-3">
						<div className="space-y-1">
							<CardTitle>{orderDisplay.orderTitle}</CardTitle>
							<CardDescription>
								{orderDisplay.timingLabel} • Status atual:{" "}
								{orderDisplay.statusLabel}
							</CardDescription>
						</div>
						<Badge variant="outline">{orderDisplay.statusLabel}</Badge>
					</div>
					<div className="grid gap-3 sm:grid-cols-2">
						<div className="rounded-2xl border border-primary/10 bg-primary/[0.03] p-4">
							<p className="text-muted-foreground text-xs uppercase tracking-[0.18em]">
								Quarto
							</p>
							<p className="mt-2 font-medium">
								{orderDetailsQuery.data.room?.label ??
									orderDetailsQuery.data.roomId}
							</p>
						</div>
						<div className="rounded-2xl border border-primary/10 bg-primary/[0.03] p-4">
							<p className="text-muted-foreground text-xs uppercase tracking-[0.18em]">
								Itens no pedido
							</p>
							<p className="mt-2 font-medium">
								{orderDetailsQuery.data.items.length}
							</p>
						</div>
					</div>
				</div>
			</CardHeader>
			<CardContent className="space-y-5 pt-6">
				<div className="space-y-3">
					<p className="font-medium text-primary text-sm">Itens do pedido</p>
					{paginatedItems.items.map((item) => (
						<div
							className="rounded-2xl border border-primary/10 bg-primary/[0.03] p-4"
							key={item.id}
						>
							<p className="font-medium">
								{item.quantity}x {item.itemNameSnapshot}
							</p>
							{item.notes ? (
								<p className="mt-1 text-muted-foreground text-sm">
									Observacao: {item.notes}
								</p>
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
					<p className="font-medium text-primary text-sm">
						Andamento deste pedido
					</p>
					<div className="space-y-2">
						{paginatedHistory.items.map((entry) => (
							<div
								className="rounded-2xl border border-primary/10 bg-background/80 px-4 py-3 text-sm"
								key={entry.id}
							>
								{buildStaffOrderHistoryLabel({
									changedAt: entry.changedAt,
									fromStatus: entry.fromStatus,
									toStatus: entry.toStatus,
								})}
							</div>
						))}
					</div>
					<PaginationControls
						pageParam="detailsHistoryPage"
						pagination={paginatedHistory.pagination}
					/>
				</div>
			</CardContent>
		</Card>
	);
}
