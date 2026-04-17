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
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";

import { PageShell, SectionHeader } from "~/app/_components/page-shell";
import { PaginationControls } from "~/app/_components/pagination-controls";
import {
	buildPageSearch,
	parsePageParam,
	shouldSyncPageParam,
} from "~/app/_components/pagination-state";
import { useTRPC } from "~/trpc/react";
import { OrderSummaryCard } from "./order-summary-card";
import { OrderTimeline } from "./order-timeline";

export function OrderTrackingPage(props: {
	guestSessionToken: string;
	orderId: string;
}) {
	const trpc = useTRPC();
	const pathname = usePathname();
	const router = useRouter();
	const searchParams = useSearchParams();
	const detailsItemsPage = parsePageParam(
		searchParams.get("detailsItemsPage") ?? undefined,
	);
	const detailsHistoryPage = parsePageParam(
		searchParams.get("detailsHistoryPage") ?? undefined,
	);
	const trackingQuery = useQuery({
		...trpc.order.getOrderTracking.queryOptions({
			guestSessionToken: props.guestSessionToken,
			orderId: props.orderId,
		}),
		refetchInterval: 5000,
	});

	const paginatedItems = paginateItems(trackingQuery.data?.order.items ?? [], {
		page: detailsItemsPage,
		pageSize: PAGE_SIZES.categoryDetailsItems,
	});
	const paginatedHistory = paginateItems(trackingQuery.data?.history ?? [], {
		page: detailsHistoryPage,
		pageSize: PAGE_SIZES.categoryDetailsHistory,
	});

	useEffect(() => {
		if (!shouldSyncPageParam(detailsItemsPage, paginatedItems.pagination)) {
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
	}, [
		detailsItemsPage,
		paginatedItems.pagination,
		pathname,
		router,
		searchParams,
	]);

	useEffect(() => {
		if (!shouldSyncPageParam(detailsHistoryPage, paginatedHistory.pagination)) {
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
		detailsHistoryPage,
		paginatedHistory.pagination,
		pathname,
		router,
		searchParams,
	]);

	if (trackingQuery.isLoading) {
		return (
			<main className="mx-auto flex min-h-screen max-w-5xl items-center px-4 py-10">
				<Card className="w-full border-primary/20 border-dashed bg-card/88">
					<CardHeader>
						<CardTitle>Carregando pedido</CardTitle>
						<CardDescription>
							Estamos buscando o status mais recente do seu pedido.
						</CardDescription>
					</CardHeader>
				</Card>
			</main>
		);
	}

	if (trackingQuery.error || !trackingQuery.data) {
		return (
			<main className="mx-auto flex min-h-screen max-w-5xl items-center px-4 py-10">
				<Card className="w-full border-destructive/20 bg-destructive/5">
					<CardHeader>
						<CardTitle>Pedido indisponivel</CardTitle>
						<CardDescription>
							{trackingQuery.error?.message ??
								"Nao foi possivel carregar o rastreamento agora."}
						</CardDescription>
					</CardHeader>
					<CardContent>
						<Button
							render={<Link href={`/g/${props.guestSessionToken}/menu`} />}
							variant="outline"
						>
							Voltar ao cardapio
						</Button>
					</CardContent>
				</Card>
			</main>
		);
	}

	return (
		<PageShell containerClassName="max-w-5xl gap-8">
			<SectionHeader
				badge="Pedido confirmado"
				description="O status desta pagina e atualizado automaticamente para que voce acompanhe o room service com mais clareza e confianca."
				title="Acompanhe seu room service em tempo real"
			/>

			<div className="grid gap-3 md:grid-cols-3">
				<Card className="border-primary/15 bg-card/88" size="sm">
					<CardContent className="space-y-1 pt-4">
						<p className="font-medium text-primary text-sm">Status atual</p>
						<p className="font-semibold text-lg">
							{trackingQuery.data.order.status.replaceAll("_", " ")}
						</p>
					</CardContent>
				</Card>
				<Card className="border-primary/15 bg-card/88" size="sm">
					<CardContent className="space-y-1 pt-4">
						<p className="font-medium text-primary text-sm">Quarto</p>
						<p className="font-semibold text-lg">
							{trackingQuery.data.order.roomLabel ??
								trackingQuery.data.order.roomId}
						</p>
					</CardContent>
				</Card>
				<Card className="border-primary/15 bg-card/88" size="sm">
					<CardContent className="space-y-1 pt-4">
						<p className="font-medium text-primary text-sm">Itens</p>
						<p className="font-semibold text-lg">
							{trackingQuery.data.order.items.length}
						</p>
					</CardContent>
				</Card>
			</div>

			<div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
				<div className="space-y-3">
					<OrderSummaryCard
						order={{
							...trackingQuery.data.order,
							items: paginatedItems.items,
						}}
					/>
					<PaginationControls
						pageParam="detailsItemsPage"
						pagination={paginatedItems.pagination}
					/>
				</div>
				<div className="space-y-3">
					<OrderTimeline history={paginatedHistory.items} />
					<PaginationControls
						pageParam="detailsHistoryPage"
						pagination={paginatedHistory.pagination}
					/>
				</div>
			</div>
		</PageShell>
	);
}
