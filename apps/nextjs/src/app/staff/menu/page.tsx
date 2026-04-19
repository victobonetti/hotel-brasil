import { Suspense } from "react";
import { getStaffShellContext } from "~/app/_components/staff-shell-context";
import { HydrateClient } from "~/trpc/server";

import { StaffMenuPage } from "./_components/staff-menu-page";

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
