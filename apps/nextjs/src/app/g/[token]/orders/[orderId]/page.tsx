import { Suspense } from "react";
import { HydrateClient, prefetch, trpc } from "~/trpc/server";

import { OrderTrackingPage } from "./_components/order-tracking-page";

async function OrderTrackingData(props: {
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

export default function OrderTrackingRoute(props: {
	params: Promise<{ orderId: string; token: string }>;
}) {
	return (
		<Suspense>
			<OrderTrackingData {...props} />
		</Suspense>
	);
}
