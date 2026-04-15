import { redirect } from "next/navigation";

export default async function GuestSessionEntryPage(props: {
	params: Promise<{ token: string }>;
}) {
	const { token } = await props.params;

	redirect(`/g/${token}/menu`);
}
