import { Suspense } from "react";

import { HydrateClient, prefetch, trpc } from "~/trpc/server";
import { GuestOrdersPage } from "./_components/guest-orders-page";

async function GuestOrdersData(props: {
	params: Promise<{ token: string }>;
}) {
	const { token } = await props.params;

	prefetch(
		trpc.order.listGuestOrders.queryOptions({
			guestSessionToken: token,
		}),
	);

	return (
		<HydrateClient>
			<GuestOrdersPage guestSessionToken={token} />
		</HydrateClient>
	);
}

export default function GuestOrdersRoute(props: {
	params: Promise<{ token: string }>;
}) {
	return (
		<Suspense>
			<GuestOrdersData {...props} />
		</Suspense>
	);
}
