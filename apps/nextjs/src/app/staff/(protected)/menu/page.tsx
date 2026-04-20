import { Suspense } from "react";

import { getStaffShellContext } from "~/app/_components/staff-shell-context";
import { StaffMenuPage } from "~/app/staff/menu/_components/staff-menu-page";
import { HydrateClient } from "~/trpc/server";

async function StaffMenuData() {
	const staffContext = await getStaffShellContext();

	return (
		<HydrateClient>
			<StaffMenuPage staffContext={staffContext} />
		</HydrateClient>
	);
}

export default function StaffMenuRoute() {
	return (
		<Suspense>
			<StaffMenuData />
		</Suspense>
	);
}
