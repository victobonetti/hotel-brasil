import type { ReturnTypeOfGetStaffAccessSummary } from "./auth-showcase-view.types";

export function AuthShowcaseSignedInView(props: {
	access: ReturnTypeOfGetStaffAccessSummary;
	userName: string;
}) {
	return (
		<section className="min-w-[220px] rounded-[1.4rem] border border-[#ead8d1] bg-white/90 px-3 py-2.5 shadow-[0_18px_40px_-34px_rgba(86,59,52,0.24)] backdrop-blur-md">
			<p className="text-[10px] text-foreground/60 uppercase tracking-[0.22em]">
				Bem-vindo
			</p>
			<p className="mt-0.5 max-w-[190px] truncate font-medium text-foreground text-sm">
				{props.userName}
			</p>
			{props.access.canAccessOrders ? (
				<a
					className="mt-2 inline-flex h-9 items-center rounded-full border border-primary/20 bg-primary/10 px-3.5 font-medium text-primary text-sm transition hover:bg-primary/16"
					href="/staff/orders"
				>
					Ver painel adm
				</a>
			) : null}
		</section>
	);
}
