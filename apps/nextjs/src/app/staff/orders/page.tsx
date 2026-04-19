import { Suspense } from "react";
import { parsePageParam } from "~/app/_components/pagination-state";
import { getStaffShellContext } from "~/app/_components/staff-shell-context";
import { HydrateClient, prefetch, trpc } from "~/trpc/server";

import { OperationalDashboardPage } from "./_components/operational-dashboard-page";

async function StaffOrdersData(props: {
	searchParams?: Promise<Record<string, string | Array<string> | undefined>>;
}) {
	const searchParams = props.searchParams
		? await props.searchParams
		: undefined;
	const page = parsePageParam(searchParams?.page);
	const staffContext = await getStaffShellContext();

	prefetch(
		trpc.staffOrder.listActiveOrders.queryOptions({
			page,
		}),
	);

	return (
		<HydrateClient>
			<OperationalDashboardPage staffContext={staffContext} />
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
