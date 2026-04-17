import { parsePageParam } from "~/app/_components/pagination-state";
import { HydrateClient, prefetch, trpc } from "~/trpc/server";

import { OperationalDashboardPage } from "./_components/operational-dashboard-page";

export default async function StaffOrdersPage(props: {
	searchParams?: Promise<Record<string, string | Array<string> | undefined>>;
}) {
	const searchParams = props.searchParams
		? await props.searchParams
		: undefined;
	const page = parsePageParam(searchParams?.page);

	prefetch(
		trpc.staffOrder.listActiveOrders.queryOptions({
			page,
		}),
	);

	return (
		<HydrateClient>
			<OperationalDashboardPage />
		</HydrateClient>
	);
}
