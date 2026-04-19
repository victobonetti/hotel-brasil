import { cn } from "@nowait24/ui/lib/utils";

export function PageShell(props: {
	children: React.ReactNode;
	className?: string;
	containerClassName?: string;
	sidebar?: React.ReactNode;
	sidebarClassName?: string;
}) {
	return (
		<main
			className={cn(
				"min-h-screen bg-[linear-gradient(180deg,_color-mix(in_oklab,var(--background)_98%,white_2%)_0%,_var(--background)_100%)] text-foreground",
				props.className,
			)}
		>
			{props.sidebar ? (
				<>
					<aside className={cn("hidden lg:block", props.sidebarClassName)}>
						{props.sidebar}
					</aside>
					<div className="px-4 py-4 lg:hidden">{props.sidebar}</div>
					<div
						className={cn(
							"mx-auto flex w-full max-w-7xl flex-col gap-5 px-4 pt-2 pb-8 md:px-8 md:pb-10 lg:pt-8 lg:pr-10 lg:pl-[18rem]",
							props.containerClassName,
						)}
					>
						{props.children}
					</div>
				</>
			) : (
				<div
					className={cn(
						"mx-auto flex w-full max-w-7xl flex-col gap-5 px-4 py-6 md:px-8 md:py-8",
						props.containerClassName,
					)}
				>
					{props.children}
				</div>
			)}
		</main>
	);
}

export function SectionHeader(props: {
	actions?: React.ReactNode;
	badge?: string;
	description: string;
	supportingPanel?: React.ReactNode;
	title: string;
}) {
	return (
		<header className="grid gap-3 xl:grid-cols-[minmax(0,1fr)_220px] xl:items-start">
			<div className="rounded-[1.75rem] border border-border/60 bg-card/88 px-5 py-4 shadow-[0_24px_50px_-44px_rgba(25,18,15,0.28)] md:px-6">
				<div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
					<div className="space-y-2">
						{props.badge ? (
							<div className="inline-flex w-fit rounded-full bg-primary/8 px-2.5 py-1 font-medium text-[11px] text-primary uppercase tracking-[0.18em]">
								{props.badge}
							</div>
						) : null}
						<div className="space-y-1">
							<h1 className="font-semibold text-2xl tracking-tight md:text-[2rem]">
								{props.title}
							</h1>
							<p className="max-w-xl text-muted-foreground text-sm leading-6">
								{props.description}
							</p>
						</div>
					</div>
					{props.actions ? (
						<div className="flex flex-wrap gap-2 lg:justify-end">
							{props.actions}
						</div>
					) : null}
				</div>
			</div>
			{props.supportingPanel ? (
				<div className="rounded-[1.75rem] border border-border/60 bg-background/84 px-4 py-3 shadow-[0_20px_44px_-40px_rgba(25,18,15,0.22)]">
					{props.supportingPanel}
				</div>
			) : null}
		</header>
	);
}

export function StickyAdminHeader(props: { children: React.ReactNode }) {
	return (
		<div className="sticky top-3 z-30 space-y-3 rounded-[2rem] bg-[linear-gradient(180deg,color-mix(in_oklab,var(--background)_78%,white_22%)_0%,color-mix(in_oklab,var(--background)_92%,transparent)_100%)] pb-1 backdrop-blur-md md:top-4">
			{props.children}
		</div>
	);
}
