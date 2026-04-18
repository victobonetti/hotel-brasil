import type { ReturnTypeOfGetStaffAccessSummary } from "./auth-showcase-view.types";

export function AuthShowcaseSignedInView(props: {
	access: ReturnTypeOfGetStaffAccessSummary;
	userName: string;
}) {
	return (
		<section className="ml-auto w-full max-w-[280px] rounded-[1.75rem] border border-white/60 bg-white/65 p-4 shadow-[0_24px_70px_-45px_color-mix(in_oklab,var(--primary)_35%,transparent)] backdrop-blur-md">
			<p className="text-foreground/60 text-xs uppercase tracking-[0.22em]">
				Bem-vindo
			</p>
			<p className="mt-1 truncate font-medium text-base text-foreground">
				{props.userName}
			</p>
			{props.access.canAccessOrders ? (
				<a
					className="mt-4 inline-flex items-center rounded-full border border-primary/20 bg-primary/10 px-4 py-2 font-medium text-primary text-sm transition hover:bg-primary/16"
					href="/staff/orders"
				>
					Ver painel adm
				</a>
			) : null}
		</section>
	);
}
