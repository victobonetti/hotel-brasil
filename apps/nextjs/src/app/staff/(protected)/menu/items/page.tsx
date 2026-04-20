import { Suspense } from "react";

import { getStaffShellContext } from "~/app/_components/staff-shell-context";
import { StaffMenuItemsPage } from "~/app/staff/menu/items/_components/staff-menu-items-page";
import { HydrateClient } from "~/trpc/server";

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
