import { redirect } from "next/navigation";
import { Suspense } from "react";

import { getStaffAccessContext } from "~/app/_components/staff-access-context";

async function GuestAreaGuard(props: { children: React.ReactNode }) {
	const access = await getStaffAccessContext();

	if (access.session && access.needsOnboarding) {
		redirect("/staff/onboarding");
	}

	return props.children;
}

export default function GuestAreaLayout(props: { children: React.ReactNode }) {
	return (
		<Suspense fallback={null}>
			<GuestAreaGuard>{props.children}</GuestAreaGuard>
		</Suspense>
	);
}
