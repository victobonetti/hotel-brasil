"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";

import { PageShell, SectionHeader } from "~/app/_components/page-shell";
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
	const queryClient = useQueryClient();
	const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
	const activeOrdersQuery = useQuery({
		...trpc.staffOrder.listActiveOrders.queryOptions(),
		refetchInterval: 5000,
	});

	const state = activeOrdersQuery.isLoading
		? "loading"
		: activeOrdersQuery.error?.data?.code === "UNAUTHORIZED"
			? "needs-auth"
			: activeOrdersQuery.error
				? "unauthorized"
				: undefined;

	const activeOrders = activeOrdersQuery.data ?? [];
	const totalRevenueInCents = activeOrders.reduce(
		(total, order) => total + order.totalAmountInCents,
		0,
	);

	return (
		<PageShell>
			<SectionHeader
				badge="Operação do hotel"
				description="Acompanhe a fila ativa, abra detalhes com mais rapidez e avance os pedidos do seu hotel com uma leitura mais clara da operação."
				title="Painel operacional de pedidos"
			/>

			<StaffHotelGuard errorMessage={activeOrdersQuery.error?.message} state={state}>
				<div className="grid gap-3 md:grid-cols-3">
					<div className="rounded-2xl border border-primary/15 bg-card/88 p-4 shadow-sm shadow-primary/10">
						<p className="font-medium text-primary text-sm">Pedidos ativos</p>
						<p className="mt-2 font-semibold text-3xl">{activeOrders.length}</p>
					</div>
					<div className="rounded-2xl border border-primary/15 bg-card/88 p-4 shadow-sm shadow-primary/10">
						<p className="font-medium text-primary text-sm">Pedido em foco</p>
						<p className="mt-2 font-semibold text-3xl">{selectedOrderId ? 1 : 0}</p>
					</div>
					<div className="rounded-2xl border border-primary/15 bg-card/88 p-4 shadow-sm shadow-primary/10">
						<p className="font-medium text-primary text-sm">Volume na fila</p>
						<p className="mt-2 font-semibold text-3xl">
							{formatPrice(totalRevenueInCents)}
						</p>
					</div>
				</div>

				<div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
					<OrderQueueBoard
						onSelect={setSelectedOrderId}
						orders={activeOrders}
						selectedOrderId={selectedOrderId}
					/>
					<OrderDetailsDrawer
						onRefresh={() => {
							void queryClient.invalidateQueries({
								queryKey: trpc.staffOrder.listActiveOrders.queryKey(),
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
