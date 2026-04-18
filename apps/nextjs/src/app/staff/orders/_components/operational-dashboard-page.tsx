"use client";

import { Button } from "@nowait24/ui/button";
import { useQuery, useQueryClient } from "@tanstack/react-query";
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
import { StaffNav } from "~/app/_components/staff-nav";
import { PackageIcon, RefreshIcon } from "~/app/_components/ui-icons";
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
				actions={
					<>
						<Button
							onClick={() => {
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
							}}
							variant="outline"
						>
							<RefreshIcon className="size-4" />
							Atualizar agora
						</Button>
						<Button render={<Link href="/staff/menu" />} variant="secondary">
							<PackageIcon className="size-4" />
							Revisar cardapio
						</Button>
					</>
				}
				badge="Operacao do hotel"
				description="Veja o que exige atencao agora, acompanhe o historico recente e mantenha a operacao andando sem precisar decifrar a tela."
				supportingPanel={
					<div className="rounded-[2rem] border border-primary/15 bg-card/84 p-6 shadow-primary/10 shadow-sm">
						<p className="font-medium text-primary text-xs uppercase tracking-[0.18em]">
							Como ler esta area
						</p>
						<div className="mt-3 space-y-3 text-muted-foreground text-sm leading-6">
							<p>Comece pela fila ativa para decidir o proximo pedido.</p>
							<p>
								Abra um pedido para ver itens, historico e acoes em um so lugar.
							</p>
							<p>
								Use o historico recente para conferir o que acabou de sair da
								operacao.
							</p>
						</div>
					</div>
				}
				title="Painel operacional de pedidos"
			/>

			<StaffHotelGuard
				errorMessage={activeOrdersQuery.error?.message}
				state={state}
			>
				<div className="grid gap-3 md:grid-cols-3">
					<div className="rounded-[1.75rem] border border-primary/15 bg-card/88 p-5 shadow-primary/10 shadow-sm">
						<p className="font-medium text-primary text-sm">Fila ativa</p>
						<p className="mt-2 font-semibold text-3xl">
							{pagination?.totalItems ?? 0}
						</p>
						<p className="mt-2 text-muted-foreground text-sm">
							Pedidos aguardando acompanhamento nesta pagina.
						</p>
					</div>
					<div className="rounded-[1.75rem] border border-primary/15 bg-card/88 p-5 shadow-primary/10 shadow-sm">
						<p className="font-medium text-primary text-sm">
							Entregas recentes
						</p>
						<p className="mt-2 font-semibold text-3xl">{recentOrders.length}</p>
						<p className="mt-2 text-muted-foreground text-sm">
							Itens concluidos que ainda valem uma conferida.
						</p>
					</div>
					<div className="rounded-[1.75rem] border border-primary/15 bg-card/88 p-5 shadow-primary/10 shadow-sm">
						<p className="font-medium text-primary text-sm">
							Volume monitorado
						</p>
						<p className="mt-2 font-semibold text-3xl">
							{formatPrice(totalRevenueInCents)}
						</p>
						<p className="mt-2 text-muted-foreground text-sm">
							Valor somado dos pedidos ativos exibidos agora.
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
