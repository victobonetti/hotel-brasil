import { parsePageParam } from "~/app/_components/pagination-state";
import { Suspense } from "react";
import { HydrateClient, prefetch, trpc } from "~/trpc/server";
import { GuestMenuPage } from "./_components/guest-menu-page";

async function GuestMenuData(props: {
	params: Promise<{ token: string }>;
	searchParams?: Promise<Record<string, string | Array<string> | undefined>>;
}) {
	const { token } = await props.params;
	const searchParams = props.searchParams
		? await props.searchParams
		: undefined;
	const page = parsePageParam(searchParams?.page);

	prefetch(
		trpc.menu.getMenuForGuestSession.queryOptions({
			guestSessionToken: token,
			page,
		}),
	);

	return (
		<HydrateClient>
			<GuestMenuPage guestSessionToken={token} />
		</HydrateClient>
	);
}

export default function GuestMenuRoute(props: {
	params: Promise<{ token: string }>;
	searchParams?: Promise<Record<string, string | Array<string> | undefined>>;
}) {
	return (
		<Suspense>
			<GuestMenuData {...props} />
		</Suspense>
	);
}
