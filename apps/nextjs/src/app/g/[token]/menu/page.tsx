import { HydrateClient, prefetch, trpc } from "~/trpc/server";
import { GuestMenuPage } from "./_components/guest-menu-page";

export default async function GuestMenuRoute(props: {
	params: Promise<{ token: string }>;
}) {
	const { token } = await props.params;

	prefetch(
		trpc.menu.getMenuForGuestSession.queryOptions({
			guestSessionToken: token,
		}),
	);

	return (
		<HydrateClient>
			<GuestMenuPage guestSessionToken={token} />
		</HydrateClient>
	);
}
