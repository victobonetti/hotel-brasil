import { Badge } from "@nowait24/ui/badge";

type OrderStatus =
	| "accepted"
	| "cancelled"
	| "delivered"
	| "out_for_delivery"
	| "pending"
	| "preparing";

const labels: Record<OrderStatus, string> = {
	accepted: "Aceito",
	cancelled: "Cancelado",
	delivered: "Entregue",
	out_for_delivery: "Saiu para entrega",
	pending: "Recebido",
	preparing: "Em preparo",
};

const variants: Record<
	OrderStatus,
	"default" | "destructive" | "secondary" | "outline"
> = {
	accepted: "secondary",
	cancelled: "destructive",
	delivered: "default",
	out_for_delivery: "secondary",
	pending: "outline",
	preparing: "secondary",
};

const softStyles: Record<OrderStatus, string> = {
	accepted: "border-[#f2d4cc] bg-[#fff1ec] text-[#b15a45]",
	cancelled: "border-[#e8d3cf] bg-[#f6efed] text-[#76534d]",
	delivered: "border-[#d7e6db] bg-[#eef8f0] text-[#2f6c45]",
	out_for_delivery: "border-[#f2d4cc] bg-[#fff1ec] text-[#b15a45]",
	pending: "border-[#edd8d2] bg-[#fff9f5] text-[#8d655c]",
	preparing: "border-[#f2d4cc] bg-[#fff1ec] text-[#b15a45]",
};

export function OrderStatusBadge(props: { status: OrderStatus }) {
	return (
		<Badge
			className={`rounded-full border px-3 py-1 shadow-none ${softStyles[props.status]}`}
			variant={variants[props.status]}
		>
			{labels[props.status]}
		</Badge>
	);
}
