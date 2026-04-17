import { Suspense } from "react";
import { HydrateClient } from "~/trpc/server";

import { StaffRoomsPage } from "./_components/staff-rooms-page";

export default function StaffRoomsRoute() {
	return (
		<HydrateClient>
			<Suspense>
				<StaffRoomsPage />
			</Suspense>
		</HydrateClient>
	);
}
