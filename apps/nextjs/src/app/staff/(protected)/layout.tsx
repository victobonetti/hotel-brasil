import { redirect } from "next/navigation";
import { Suspense } from "react";

import { getStaffAccessContext } from "~/app/_components/staff-access-context";

async function ProtectedStaffGuard(props: { children: React.ReactNode }) {
	const access = await getStaffAccessContext();

	if (!access.session) {
		redirect("/");
	}

	if (access.needsOnboarding) {
		redirect("/staff/onboarding");
	}

	return props.children;
}

export default function ProtectedStaffLayout(props: {
	children: React.ReactNode;
}) {
	return (
		<Suspense fallback={null}>
			<ProtectedStaffGuard>{props.children}</ProtectedStaffGuard>
		</Suspense>
	);
}
