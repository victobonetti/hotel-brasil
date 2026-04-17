import { parsePageParam } from "~/app/_components/pagination-state";
import { Suspense } from "react";
import { HydrateClient, prefetch, trpc } from "~/trpc/server";

import { OperationalDashboardPage } from "./_components/operational-dashboard-page";

async function StaffOrdersData(props: {
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

export default function StaffOrdersRoute(props: {
	searchParams?: Promise<Record<string, string | Array<string> | undefined>>;
}) {
	return (
		<Suspense>
			<StaffOrdersData {...props} />
		</Suspense>
	);
}
