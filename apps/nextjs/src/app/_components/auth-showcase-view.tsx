import type { ReturnTypeOfGetStaffAccessSummary } from "./auth-showcase-view.types";
import { ShieldIcon } from "./ui-icons";

export function AuthShowcaseSignedInView(props: {
	access: ReturnTypeOfGetStaffAccessSummary;
	userName: string;
}) {
	return (
		<section className="min-w-[220px] rounded-[1.35rem] border border-[#ead8d1] bg-[linear-gradient(180deg,rgba(255,255,255,0.94)_0%,rgba(251,247,245,0.98)_100%)] px-3.5 py-3 shadow-[0_18px_40px_-34px_rgba(86,59,52,0.24)]">
			<div className="flex items-start gap-2.5">
				<div className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-2xl bg-primary/8 text-primary">
					<ShieldIcon className="size-4" />
				</div>
				<div className="min-w-0 flex-1">
					<p className="text-[10px] text-foreground/60 uppercase tracking-[0.22em]">
						Painel da equipe
					</p>
					<p className="mt-0.5 truncate font-medium text-foreground text-sm">
						{props.userName}
					</p>
					<p className="mt-1 line-clamp-2 text-muted-foreground text-xs leading-5">
						{props.access.title}
					</p>
				</div>
			</div>
			<a
				className="mt-3 inline-flex h-9 items-center rounded-full border border-primary/20 bg-primary/10 px-3.5 font-medium text-primary text-sm transition hover:bg-primary/16"
				href={
					props.access.canAccessOrders ? "/staff/orders" : "/staff/onboarding"
				}
			>
				{props.access.canAccessOrders ? "Abrir painel" : "Concluir setup"}
			</a>
		</section>
	);
}
