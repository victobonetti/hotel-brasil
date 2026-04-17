import { Suspense } from "react";
import { appRouter, createTRPCContext } from "@finchat/api";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "~/auth/server";

async function GuestSessionData(props: {
	params: Promise<{ token: string }>;
}) {
	const { token } = await props.params;
	const context = await createTRPCContext({
		auth,
		headers: new Headers(await headers()),
	});
	const caller = appRouter.createCaller(context);
	const guestSession =
		await caller.guestSession.createGuestSessionFromRoomToken({
			roomToken: token,
		});

	redirect(`/g/${guestSession.token}/menu`);
}

export default function GuestSessionEntryRoute(props: {
	params: Promise<{ token: string }>;
}) {
	return (
		<Suspense>
			<GuestSessionData {...props} />
		</Suspense>
	);
}
