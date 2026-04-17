import { HydrateClient, prefetch, trpc } from "~/trpc/server";

import { OrderTrackingPage } from "./_components/order-tracking-page";

export default async function OrderTrackingRoute(props: {
	params: Promise<{ orderId: string; token: string }>;
}) {
	const { orderId, token } = await props.params;

	prefetch(
		trpc.order.getOrderTracking.queryOptions({
			guestSessionToken: token,
			orderId,
		}),
	);

	return (
		<HydrateClient>
			<OrderTrackingPage guestSessionToken={token} orderId={orderId} />
		</HydrateClient>
	);
}
