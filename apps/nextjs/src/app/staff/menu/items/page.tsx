import { Suspense } from "react";
import { HydrateClient } from "~/trpc/server";

import { StaffMenuItemsPage } from "./_components/staff-menu-items-page";

export default function StaffMenuItemsRoute() {
	return (
		<HydrateClient>
			<Suspense>
				<StaffMenuItemsPage />
			</Suspense>
		</HydrateClient>
	);
}
