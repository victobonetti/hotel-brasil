import { HydrateClient } from "~/trpc/server";

import { StaffRoomsPage } from "./_components/staff-rooms-page";

export default function StaffRoomsRoute() {
	return (
		<HydrateClient>
			<StaffRoomsPage />
		</HydrateClient>
	);
}
