import { HydrateClient, prefetch, trpc } from "~/trpc/server";

import { OperationalDashboardPage } from "./_components/operational-dashboard-page";

export default function StaffOrdersPage() {
	prefetch(trpc.staffOrder.listActiveOrders.queryOptions());

	return (
		<HydrateClient>
			<OperationalDashboardPage />
		</HydrateClient>
	);
}
