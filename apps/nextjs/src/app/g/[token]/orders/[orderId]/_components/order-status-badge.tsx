import { Badge } from "@finchat/ui/badge";

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

export function OrderStatusBadge(props: { status: OrderStatus }) {
	return (
		<Badge className="rounded-full px-3 py-1" variant={variants[props.status]}>
			{labels[props.status]}
		</Badge>
	);
}
