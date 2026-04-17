import { Suspense } from "react";
import { HydrateClient } from "~/trpc/server";

import { StaffMenuPage } from "./_components/staff-menu-page";

export default function StaffMenuRoute() {
	return (
		<HydrateClient>
			<Suspense>
				<StaffMenuPage />
			</Suspense>
		</HydrateClient>
	);
}
