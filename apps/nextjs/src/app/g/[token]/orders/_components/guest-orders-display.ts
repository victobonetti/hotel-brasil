type GuestOrderStatus =
	| "accepted"
	| "cancelled"
	| "delivered"
	| "out_for_delivery"
	| "pending"
	| "preparing";

type GuestOrderLike = {
	placedAt: Date;
	status: GuestOrderStatus;
};

const activeStatuses: Array<GuestOrderStatus> = [
	"pending",
	"accepted",
	"preparing",
	"out_for_delivery",
];

export function isGuestOrderActiveStatus(status: GuestOrderStatus) {
	return activeStatuses.includes(status);
}

export function partitionGuestOrders<TOrder extends GuestOrderLike>(
	orders: Array<TOrder>,
) {
	return orders.reduce(
		(result, order) => {
			if (isGuestOrderActiveStatus(order.status)) {
				result.activeOrders.push(order);
			} else {
				result.historyOrders.push(order);
			}

			return result;
		},
		{
			activeOrders: [] as Array<TOrder>,
			historyOrders: [] as Array<TOrder>,
		},
	);
}
