import { Badge } from "@nowait24/ui/badge";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@nowait24/ui/card";

import { getOrderDisplayMeta } from "~/app/_components/order-display";
import { OrderStatusBadge } from "./order-status-badge";

interface OrderSummary {
	id: string;
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
	roomLabel?: string | null;
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
		dateStyle: "short",
		timeStyle: "short",
	}).format(date);
}

export function OrderSummaryCard(props: { order: OrderSummary }) {
	const orderDisplay = getOrderDisplayMeta({
		orderId: props.order.id,
		roomId: props.order.roomId,
		roomLabel: props.order.roomLabel,
	});

	return (
		<Card className="overflow-hidden rounded-[28px] border-white/60 bg-white/88 shadow-[0_20px_70px_-30px_rgba(234,29,44,0.45)] backdrop-blur">
			<CardHeader className="border-white/70 border-b bg-white/70">
				<div className="space-y-4">
					<div className="flex flex-wrap items-center justify-between gap-3">
						<div className="space-y-1">
							<CardTitle className="text-lg">Resumo do pedido</CardTitle>
							<CardDescription>
								{orderDisplay.orderTitle} • {formatDate(props.order.placedAt)}
							</CardDescription>
						</div>
						<OrderStatusBadge status={props.order.status} />
					</div>
					<div className="flex flex-wrap gap-2">
						<Badge className="rounded-full border-0 bg-[#fff3f1] px-3 py-1 text-[#b42318] shadow-none hover:bg-[#fff3f1]">
							{orderDisplay.roomReference}
						</Badge>
						<Badge className="rounded-full border-0 bg-slate-100 px-3 py-1 text-slate-700 shadow-none hover:bg-slate-100">
							{props.order.items.length} item(ns)
						</Badge>
					</div>
				</div>
			</CardHeader>
			<CardContent className="space-y-5 pt-5">
				<div className="space-y-3">
					{props.order.items.map((item) => (
						<div
							className="flex items-start gap-3 rounded-[24px] border border-[#f4d6d2] bg-[#fffaf9] p-4"
							key={item.id}
						>
							<div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-[#ea1d2c] font-semibold text-sm text-white">
								{item.quantity}x
							</div>
							<div className="flex min-w-0 flex-1 items-start justify-between gap-3">
								<div className="space-y-1">
									<p className="font-medium text-[15px]">
										{item.itemNameSnapshot}
									</p>
									{item.notes ? (
										<p className="text-muted-foreground text-sm">
											{item.notes}
										</p>
									) : (
										<p className="text-muted-foreground text-sm">
											Sem observacoes para este item.
										</p>
									)}
								</div>
								<Badge className="rounded-full border-0 bg-slate-900 px-3 py-1 text-white shadow-none hover:bg-slate-900">
									{formatPrice(item.lineTotalInCents)}
								</Badge>
							</div>
						</div>
					))}
				</div>

				{props.order.notes ? (
					<div className="rounded-[24px] border border-[#f4d6d2] bg-[#fff6f4] p-4 text-sm">
						<p className="font-medium text-[#b42318]">Observacoes do pedido</p>
						<p className="mt-1 text-muted-foreground">{props.order.notes}</p>
					</div>
				) : null}

				<div className="flex items-center justify-between rounded-[24px] bg-slate-950 px-4 py-4 text-white">
					<div>
						<p className="text-white/70 text-xs uppercase tracking-[0.24em]">
							Total
						</p>
						<p className="font-medium text-sm">Pagamento no room service</p>
					</div>
					<span className="font-semibold text-xl">
						{formatPrice(props.order.totalAmountInCents)}
					</span>
				</div>
			</CardContent>
		</Card>
	);
}
