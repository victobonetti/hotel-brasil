import { appRouter, createTRPCContext } from "@finchat/api";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "~/auth/server";

export default async function GuestSessionEntryPage(props: {
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
