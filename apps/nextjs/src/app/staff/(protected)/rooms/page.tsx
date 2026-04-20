import { Suspense } from "react";

import { getStaffShellContext } from "~/app/_components/staff-shell-context";
import { StaffRoomsPage } from "~/app/staff/rooms/_components/staff-rooms-page";
import { HydrateClient } from "~/trpc/server";

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
