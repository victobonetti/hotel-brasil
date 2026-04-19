import { Suspense } from "react";
import { getStaffShellContext } from "~/app/_components/staff-shell-context";
import { HydrateClient } from "~/trpc/server";

import { StaffRoomsPage } from "./_components/staff-rooms-page";

async function StaffRoomsData() {
	const staffContext = await getStaffShellContext();

	return (
		<HydrateClient>
			<StaffRoomsPage staffContext={staffContext} />
		</HydrateClient>
	);
}

export default function StaffRoomsRoute() {
	return (
		<Suspense>
			<StaffRoomsData />
		</Suspense>
	);
}
