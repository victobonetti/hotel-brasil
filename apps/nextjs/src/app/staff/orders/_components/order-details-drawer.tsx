"use client";

import { Button } from "@finchat/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@finchat/ui/card";
import { useQuery } from "@tanstack/react-query";

import { useTRPC } from "~/trpc/react";
import { OrderActionButtons } from "./order-action-buttons";

export function OrderDetailsDrawer(props: {
	onRefresh?: () => void;
	orderId: string | null;
}) {
	const trpc = useTRPC();
	const orderDetailsQuery = useQuery({
		...trpc.staffOrder.getOrderDetails.queryOptions(
			props.orderId ? { orderId: props.orderId } : undefined!,
		),
		enabled: Boolean(props.orderId),
	});

	if (!props.orderId) {
		return (
			<Card>
				<CardHeader>
					<CardTitle>Detalhes do pedido</CardTitle>
					<CardDescription>
						Selecione um pedido da fila para ver itens, histórico e ações.
					</CardDescription>
				</CardHeader>
			</Card>
		);
	}

	if (orderDetailsQuery.isLoading) {
		return (
			<Card>
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
					<CardTitle>Pedido indisponível</CardTitle>
					<CardDescription>
						{orderDetailsQuery.error?.message ??
							"Não foi possível carregar esse pedido."}
					</CardDescription>
				</CardHeader>
			</Card>
		);
	}

	return (
		<Card>
			<CardHeader>
				<div className="space-y-1">
					<CardTitle>Pedido {orderDetailsQuery.data.id}</CardTitle>
					<CardDescription>
						Quarto {orderDetailsQuery.data.roomId} • status atual{" "}
						{orderDetailsQuery.data.status}
					</CardDescription>
				</div>
			</CardHeader>
			<CardContent className="space-y-5">
				<div className="space-y-3">
					{orderDetailsQuery.data.items.map((item) => (
						<div className="rounded-xl border border-border/60 p-3" key={item.id}>
							<p className="font-medium">
								{item.quantity}x {item.itemNameSnapshot}
							</p>
							{item.notes ? (
								<p className="text-muted-foreground text-sm">{item.notes}</p>
							) : null}
						</div>
					))}
				</div>

				<OrderActionButtons
					onSuccess={props.onRefresh}
					orderId={orderDetailsQuery.data.id}
					status={orderDetailsQuery.data.status}
				/>

				<div className="space-y-2">
					<p className="font-medium text-sm">Histórico</p>
					<div className="space-y-2">
						{orderDetailsQuery.data.statusHistory.map((entry) => (
							<div className="rounded-lg bg-muted/40 px-3 py-2 text-sm" key={entry.id}>
								{entry.toStatus}
							</div>
						))}
					</div>
				</div>

				<Button onClick={props.onRefresh} variant="outline">
					Atualizar fila
				</Button>
			</CardContent>
		</Card>
	);
}
