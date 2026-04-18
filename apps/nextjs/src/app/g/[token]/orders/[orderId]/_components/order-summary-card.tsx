import { Badge } from "@nowait24/ui/badge";
import { Card, CardContent } from "@nowait24/ui/card";

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
		<Card className="overflow-hidden rounded-[32px] border-[#efe0da] bg-[#fffdfb] shadow-[0_28px_60px_-44px_rgba(86,59,52,0.34)]">
			<CardContent className="space-y-5 p-4">
				<div className="space-y-4 rounded-[28px] bg-[#fff7f3] p-4">
					<div className="flex flex-wrap items-start justify-between gap-3">
						<div className="space-y-2">
							<div className="inline-flex rounded-full bg-white px-3 py-1 font-medium text-[#b15a45] text-[11px] uppercase tracking-[0.2em]">
								Resumo do pedido
							</div>
							<div className="space-y-1">
								<p className="font-semibold text-[#2c1b19] text-xl">
									{orderDisplay.orderTitle}
								</p>
								<p className="text-[#7d6660] text-sm">
									{formatDate(props.order.placedAt)}
								</p>
							</div>
						</div>
						<OrderStatusBadge status={props.order.status} />
					</div>
					<div className="flex flex-wrap gap-2">
						<Badge className="rounded-full border border-[#edd9d2] bg-white px-3 py-1 text-[#7d6660] shadow-none hover:bg-white">
							{orderDisplay.roomReference}
						</Badge>
						<Badge className="rounded-full border border-[#edd9d2] bg-white px-3 py-1 text-[#7d6660] shadow-none hover:bg-white">
							{props.order.items.length} item(ns)
						</Badge>
					</div>
				</div>

				<div className="space-y-3">
					{props.order.items.map((item) => (
						<div
							className="flex items-start gap-3 rounded-[26px] border border-[#efe0da] bg-white p-4"
							key={item.id}
						>
							<div className="flex size-11 shrink-0 items-center justify-center rounded-full bg-[#fff1ec] font-semibold text-[#b15a45] text-sm">
								{item.quantity}x
							</div>
							<div className="flex min-w-0 flex-1 items-start justify-between gap-3">
								<div className="space-y-1">
									<p className="font-medium text-[#2c1b19] text-[15px]">
										{item.itemNameSnapshot}
									</p>
									<p className="text-[#7d6660] text-sm">
										{item.notes || "Sem observacoes para este item."}
									</p>
								</div>
								<Badge className="rounded-full border-0 bg-[#241816] px-3 py-1 text-white shadow-none hover:bg-[#241816]">
									{formatPrice(item.lineTotalInCents)}
								</Badge>
							</div>
						</div>
					))}
				</div>

				{props.order.notes ? (
					<div className="rounded-[26px] bg-[#fff4ef] p-4 text-sm">
						<p className="font-medium text-[#b15a45]">Observacoes do pedido</p>
						<p className="mt-1 text-[#7d6660] leading-6">{props.order.notes}</p>
					</div>
				) : null}

				<div className="flex items-center justify-between gap-3 rounded-[26px] bg-[#241816] px-4 py-4 text-white">
					<div>
						<p className="text-[11px] uppercase tracking-[0.22em] text-white/58">
							Total
						</p>
						<p className="mt-1 text-sm text-white/78">
							Pagamento no room service
						</p>
					</div>
					<span className="font-semibold text-xl">
						{formatPrice(props.order.totalAmountInCents)}
					</span>
				</div>
			</CardContent>
		</Card>
	);
}
