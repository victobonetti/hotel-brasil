import { Badge } from "@finchat/ui/badge";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@finchat/ui/card";

import { OrderStatusBadge } from "./order-status-badge";

type OrderSummary = {
	items: Array<{
		id: string;
		itemNameSnapshot: string;
		lineTotalInCents: number;
		notes: string | null;
		quantity: number;
	}>;
	notes: string | null;
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
		dateStyle: "short",
		timeStyle: "short",
	}).format(date);
}

export function OrderSummaryCard(props: { order: OrderSummary }) {
	return (
		<Card className="border-primary/15 bg-card/88 shadow-sm shadow-primary/10">
			<CardHeader className="border-border/60 border-b">
				<div className="flex flex-wrap items-center justify-between gap-3">
					<div className="space-y-1">
						<CardTitle>Resumo do pedido</CardTitle>
						<CardDescription>
							Quarto {props.order.roomId} • {formatDate(props.order.placedAt)}
						</CardDescription>
					</div>
					<OrderStatusBadge status={props.order.status} />
				</div>
			</CardHeader>
			<CardContent className="space-y-4 pt-6">
				<div className="space-y-3">
					{props.order.items.map((item) => (
						<div
							className="flex items-start justify-between gap-3 rounded-2xl border border-primary/10 bg-primary/[0.03] p-4"
							key={item.id}
						>
							<div className="space-y-1">
								<p className="font-medium">
									{item.quantity}x {item.itemNameSnapshot}
								</p>
								{item.notes ? (
									<p className="text-muted-foreground text-sm">{item.notes}</p>
								) : null}
							</div>
							<Badge variant="secondary">{formatPrice(item.lineTotalInCents)}</Badge>
						</div>
					))}
				</div>

				{props.order.notes ? (
					<div className="rounded-2xl border border-primary/10 bg-background/80 p-4 text-sm">
						<p className="font-medium text-primary">Observações do pedido</p>
						<p className="mt-1 text-muted-foreground">{props.order.notes}</p>
					</div>
				) : null}

				<div className="flex items-center justify-between border-t pt-4">
					<span className="font-medium">Total</span>
					<span className="font-semibold text-lg">
						{formatPrice(props.order.totalAmountInCents)}
					</span>
				</div>
			</CardContent>
		</Card>
	);
}
