"use client";

import { Badge } from "@finchat/ui/badge";
import { Button } from "@finchat/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@finchat/ui/card";

type OrderQueueItem = {
	id: string;
	placedAt: Date;
	roomId: string;
	status:
		| "accepted"
		| "cancelled"
		| "delivered"
		| "out_for_delivery"
		| "pending"
		| "preparing";
	totalAmountInCents: number;
};

function formatPrice(priceInCents: number) {
	return new Intl.NumberFormat("pt-BR", {
		currency: "BRL",
		style: "currency",
	}).format(priceInCents / 100);
}

function formatDate(date: Date) {
	return new Intl.DateTimeFormat("pt-BR", {
		timeStyle: "short",
	}).format(date);
}

export function OrderQueueBoard(props: {
	onSelect: (orderId: string) => void;
	orders: OrderQueueItem[];
	selectedOrderId: string | null;
}) {
	return (
		<Card className="border-primary/15 bg-card/88 shadow-sm shadow-primary/10">
			<CardHeader className="border-border/60 border-b">
				<CardTitle>Fila operacional</CardTitle>
			</CardHeader>
			<CardContent className="space-y-3 pt-6">
				{props.orders.map((order) => (
					<Button
						className="h-auto w-full justify-start rounded-2xl border border-primary/10 px-4 py-4 text-left shadow-none"
						key={order.id}
						onClick={() => props.onSelect(order.id)}
						variant={props.selectedOrderId === order.id ? "secondary" : "outline"}
					>
						<div className="flex w-full flex-col gap-2">
							<div className="flex items-center justify-between gap-3">
								<div>
									<p className="font-medium">Quarto {order.roomId}</p>
									<p className="text-muted-foreground text-sm">
										{formatDate(order.placedAt)}
									</p>
								</div>
								<Badge variant="outline">{order.status}</Badge>
							</div>
							<p className="text-sm">{formatPrice(order.totalAmountInCents)}</p>
						</div>
					</Button>
				))}
				{props.orders.length === 0 ? (
					<div className="rounded-2xl border border-dashed border-primary/20 bg-primary/[0.03] px-5 py-6 text-muted-foreground text-sm">
						Não há pedidos ativos na fila neste momento.
					</div>
				) : null}
			</CardContent>
		</Card>
	);
}
