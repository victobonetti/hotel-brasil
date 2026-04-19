import { Suspense } from "react";
import { getStaffShellContext } from "~/app/_components/staff-shell-context";
import { HydrateClient } from "~/trpc/server";

import { StaffMenuItemsPage } from "./_components/staff-menu-items-page";

async function StaffMenuItemsData() {
	const staffContext = await getStaffShellContext();

	return (
		<HydrateClient>
			<StaffMenuItemsPage staffContext={staffContext} />
		</HydrateClient>
	);
}

export default function StaffMenuItemsRoute() {
	return (
		<Suspense>
			<StaffMenuItemsData />
		</Suspense>
	);
}
