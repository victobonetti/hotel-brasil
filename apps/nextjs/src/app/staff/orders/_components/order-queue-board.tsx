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
		<Card>
			<CardHeader>
				<CardTitle>Fila operacional</CardTitle>
			</CardHeader>
			<CardContent className="space-y-3">
				{props.orders.map((order) => (
					<Button
						className="h-auto w-full justify-start rounded-xl border border-border/60 px-4 py-4 text-left"
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
			</CardContent>
		</Card>
	);
}
