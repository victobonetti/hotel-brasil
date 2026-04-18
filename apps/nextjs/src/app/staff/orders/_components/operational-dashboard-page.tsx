"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import type { Route } from "next";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";

import { PageShell, SectionHeader } from "~/app/_components/page-shell";
import { PaginationControls } from "~/app/_components/pagination-controls";
import {
	buildPageSearch,
	parsePageParam,
	shouldSyncPageParam,
} from "~/app/_components/pagination-state";
import { StaffNav } from "~/app/_components/staff-nav";
import { useTRPC } from "~/trpc/react";
import { OrderDetailsDrawer } from "./order-details-drawer";
import { OrderQueueBoard } from "./order-queue-board";
import { StaffHotelGuard } from "./staff-hotel-guard";

function formatPrice(priceInCents: number) {
	return new Intl.NumberFormat("pt-BR", {
		currency: "BRL",
		style: "currency",
	}).format(priceInCents / 100);
}

export function OperationalDashboardPage() {
	const trpc = useTRPC();
	const pathname = usePathname();
	const queryClient = useQueryClient();
	const router = useRouter();
	const searchParams = useSearchParams();
	const currentPage = parsePageParam(searchParams.get("page") ?? undefined);
	const selectedOrderId = searchParams.get("orderId");
	const activeOrdersQuery = useQuery({
		...trpc.staffOrder.listActiveOrders.queryOptions({
			page: currentPage,
		}),
		refetchInterval: 5000,
	});
	const recentOrdersQuery = useQuery({
		...trpc.staffOrder.listRecentOrders.queryOptions({
			page: 1,
		}),
		refetchInterval: 5000,
	});

	let state: "loading" | "needs-auth" | "unauthorized" | undefined;
	if (activeOrdersQuery.isLoading || recentOrdersQuery.isLoading) {
		state = "loading";
	} else if (activeOrdersQuery.error?.data?.code === "UNAUTHORIZED") {
		state = "needs-auth";
	} else if (activeOrdersQuery.error || recentOrdersQuery.error) {
		state = "unauthorized";
	}

	const activeOrders = activeOrdersQuery.data?.items ?? [];
	const recentOrders = recentOrdersQuery.data?.items ?? [];
	const pagination = activeOrdersQuery.data?.pagination;
	const totalRevenueInCents = activeOrders.reduce(
		(total, order) => total + order.totalAmountInCents,
		0,
	);

	useEffect(() => {
		if (!pagination || !shouldSyncPageParam(currentPage, pagination)) {
			return;
		}

		const nextSearch = buildPageSearch(
			new URLSearchParams(searchParams.toString()),
			"page",
			pagination.page,
		);
		router.replace(
			(nextSearch.length > 0 ? `${pathname}?${nextSearch}` : pathname) as Route,
			{
				scroll: false,
			},
		);
	}, [currentPage, pagination, pathname, router, searchParams]);

	function setSelectedOrderId(orderId: string | null) {
		const nextSearchParams = new URLSearchParams(searchParams.toString());

		if (orderId) {
			nextSearchParams.set("orderId", orderId);
		} else {
			nextSearchParams.delete("orderId");
		}

		const href =
			nextSearchParams.toString().length > 0
				? `${pathname}?${nextSearchParams.toString()}`
				: pathname;
		router.replace(href as Route, { scroll: false });
	}

	return (
		<PageShell sidebar={<StaffNav />}>
			<SectionHeader
				badge="Operacao do hotel"
				description="Acompanhe a fila ativa, consulte pedidos concluidos recentes e avance a operacao com uma leitura mais clara do andamento."
				title="Painel operacional de pedidos"
			/>

			<StaffHotelGuard
				errorMessage={activeOrdersQuery.error?.message}
				state={state}
			>
				<div className="grid gap-3 md:grid-cols-3">
					<div className="rounded-2xl border border-primary/15 bg-card/88 p-4 shadow-primary/10 shadow-sm">
						<p className="font-medium text-primary text-sm">Pedidos ativos</p>
						<p className="mt-2 font-semibold text-3xl">
							{pagination?.totalItems ?? 0}
						</p>
					</div>
					<div className="rounded-2xl border border-primary/15 bg-card/88 p-4 shadow-primary/10 shadow-sm">
						<p className="font-medium text-primary text-sm">
							Historico recente
						</p>
						<p className="mt-2 font-semibold text-3xl">{recentOrders.length}</p>
					</div>
					<div className="rounded-2xl border border-primary/15 bg-card/88 p-4 shadow-primary/10 shadow-sm">
						<p className="font-medium text-primary text-sm">
							Volume nesta pagina
						</p>
						<p className="mt-2 font-semibold text-3xl">
							{formatPrice(totalRevenueInCents)}
						</p>
					</div>
				</div>

				<div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
					<div className="space-y-3">
						<OrderQueueBoard
							emptyMessage="Nao ha pedidos ativos na fila neste momento."
							onSelect={setSelectedOrderId}
							orders={activeOrders}
							selectedOrderId={selectedOrderId}
							title="Fila operacional"
						/>
						<OrderQueueBoard
							emptyMessage="Nenhum pedido concluido apareceu no historico recente."
							onSelect={setSelectedOrderId}
							orders={recentOrders}
							selectedOrderId={selectedOrderId}
							title="Historico recente"
						/>
						{pagination ? <PaginationControls pagination={pagination} /> : null}
					</div>
					<OrderDetailsDrawer
						onRefresh={() => {
							void queryClient.invalidateQueries({
								queryKey: trpc.staffOrder.listActiveOrders.queryKey({
									page: currentPage,
								}),
							});
							void queryClient.invalidateQueries({
								queryKey: trpc.staffOrder.listRecentOrders.queryKey({
									page: 1,
								}),
							});
							if (selectedOrderId) {
								void queryClient.invalidateQueries({
									queryKey: trpc.staffOrder.getOrderDetails.queryKey({
										orderId: selectedOrderId,
									}),
								});
							}
						}}
						orderId={selectedOrderId}
					/>
				</div>
			</StaffHotelGuard>
		</PageShell>
	);
}
