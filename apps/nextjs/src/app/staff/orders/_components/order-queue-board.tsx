"use client";

import { Badge } from "@finchat/ui/badge";
import { Button } from "@finchat/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@finchat/ui/card";

import { getOrderDisplayMeta } from "~/app/_components/order-display";

interface OrderQueueItem {
	id: string;
	placedAt: Date;
	roomId: string;
	room?: {
		label: string;
	} | null;
	status:
		| "accepted"
		| "cancelled"
		| "delivered"
		| "out_for_delivery"
		| "pending"
		| "preparing";
	totalAmountInCents: number;
}

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
	orders: Array<OrderQueueItem>;
	selectedOrderId: string | null;
}) {
	return (
		<Card className="border-primary/15 bg-card/88 shadow-primary/10 shadow-sm">
			<CardHeader className="border-border/60 border-b">
				<CardTitle>Fila operacional</CardTitle>
			</CardHeader>
			<CardContent className="space-y-3 pt-6">
				{props.orders.map((order) => {
					const orderDisplay = getOrderDisplayMeta({
						orderId: order.id,
						roomId: order.roomId,
						roomLabel: order.room?.label,
					});

					return (
						<Button
							className="h-auto w-full justify-start rounded-2xl border border-primary/10 px-4 py-4 text-left shadow-none"
							key={order.id}
							onClick={() => props.onSelect(order.id)}
							variant={
								props.selectedOrderId === order.id ? "secondary" : "outline"
							}
						>
							<div className="flex w-full flex-col gap-2">
								<div className="flex items-center justify-between gap-3">
									<div>
										<p className="font-medium">{orderDisplay.roomReference}</p>
										<p className="text-muted-foreground text-sm">
											{orderDisplay.orderTitle} • {formatDate(order.placedAt)}
										</p>
									</div>
									<Badge variant="outline">{order.status}</Badge>
								</div>
								<p className="text-sm">
									{formatPrice(order.totalAmountInCents)}
								</p>
							</div>
						</Button>
					);
				})}
				{props.orders.length === 0 ? (
					<div className="rounded-2xl border border-primary/20 border-dashed bg-primary/[0.03] px-5 py-6 text-muted-foreground text-sm">
						Nao ha pedidos ativos na fila neste momento.
					</div>
				) : null}
			</CardContent>
		</Card>
	);
}
