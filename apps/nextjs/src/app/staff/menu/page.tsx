import { HydrateClient } from "~/trpc/server";

import { StaffMenuPage } from "./_components/staff-menu-page";

export default function StaffMenuRoute() {
	return (
		<HydrateClient>
			<StaffMenuPage />
		</HydrateClient>
	);
}
