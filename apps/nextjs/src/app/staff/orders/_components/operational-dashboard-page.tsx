"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";

import { useTRPC } from "~/trpc/react";
import { OrderDetailsDrawer } from "./order-details-drawer";
import { OrderQueueBoard } from "./order-queue-board";
import { StaffHotelGuard } from "./staff-hotel-guard";

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

	return (
		<main className="min-h-screen bg-[linear-gradient(180deg,_rgba(248,250,252,1),_rgba(241,245,249,1))]">
			<div className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 py-10 md:px-8 md:py-14">
				<header className="space-y-2">
					<p className="font-medium text-primary text-sm">Operação do hotel</p>
					<h1 className="font-semibold text-4xl tracking-tight">
						Painel operacional de pedidos
					</h1>
					<p className="max-w-2xl text-muted-foreground">
						Acompanhe a fila ativa, veja detalhes e avance o status dos pedidos do
						seu hotel.
					</p>
				</header>

				<StaffHotelGuard state={state}>
					<div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
						<OrderQueueBoard
							onSelect={setSelectedOrderId}
							orders={activeOrdersQuery.data ?? []}
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
			</div>
		</main>
	);
}
