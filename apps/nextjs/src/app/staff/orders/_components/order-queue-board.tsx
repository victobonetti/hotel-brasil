"use client";

import { Badge } from "@nowait24/ui/badge";
import { Button } from "@nowait24/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@nowait24/ui/card";

import {
	getStaffOrderDisplayMeta,
	getStaffOrderStatusLabel,
} from "./staff-order-display";

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

function formatTime(date: Date) {
	return new Intl.DateTimeFormat("pt-BR", {
		hour: "2-digit",
		minute: "2-digit",
	}).format(date);
}

export function OrderQueueBoard(props: {
	emptyMessage: string;
	onSelect: (orderId: string) => void;
	orders: Array<OrderQueueItem>;
	selectedOrderId: string | null;
	title: string;
}) {
	return (
		<Card className="rounded-[1.75rem] border-border/70 bg-card/92 shadow-[0_24px_50px_-44px_rgba(25,18,15,0.28)]">
			<CardHeader className="border-border/60 border-b pb-4">
				<CardTitle className="text-lg">{props.title}</CardTitle>
			</CardHeader>
			<CardContent className="space-y-3 pt-5">
				{props.orders.map((order) => {
					const orderDisplay = getStaffOrderDisplayMeta({
						orderId: order.id,
						placedAt: order.placedAt,
						roomId: order.roomId,
						roomLabel: order.room?.label,
						status: order.status,
					});

					return (
						<Button
							className="h-auto w-full justify-start rounded-[1.4rem] border-border/70 px-4 py-4 text-left shadow-none"
							key={order.id}
							onClick={() => props.onSelect(order.id)}
							variant={
								props.selectedOrderId === order.id ? "secondary" : "outline"
							}
						>
							<div className="flex w-full flex-col gap-3">
								<div className="flex items-start justify-between gap-3">
									<div className="space-y-1">
										<p className="font-medium">{orderDisplay.orderReference}</p>
										<p className="text-muted-foreground text-sm">
											{formatDate(order.placedAt)}
										</p>
									</div>
									<Badge variant="outline">
										{getStaffOrderStatusLabel(order.status)}
									</Badge>
								</div>
								<div className="grid grid-cols-2 gap-2 text-sm">
									<div className="rounded-[1rem] bg-background/80 px-3 py-2">
										<p className="text-[11px] text-muted-foreground uppercase tracking-[0.18em]">
											Horario
										</p>
										<p className="mt-1 font-medium">
											{formatTime(order.placedAt)}
										</p>
									</div>
									<div className="rounded-[1rem] bg-background/80 px-3 py-2">
										<p className="text-[11px] text-muted-foreground uppercase tracking-[0.18em]">
											Total
										</p>
										<p className="mt-1 font-medium">
											{formatPrice(order.totalAmountInCents)}
										</p>
									</div>
								</div>
							</div>
						</Button>
					);
				})}
				{props.orders.length === 0 ? (
					<div className="rounded-[1.25rem] border border-border/70 border-dashed bg-background/60 px-5 py-6 text-muted-foreground text-sm">
						{props.emptyMessage}
					</div>
				) : null}
			</CardContent>
		</Card>
	);
}
