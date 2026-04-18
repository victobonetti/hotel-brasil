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
				"min-h-screen bg-[linear-gradient(180deg,_color-mix(in_oklab,var(--background)_98%,white_2%)_0%,_var(--background)_100%)]",
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
							"mx-auto flex w-full max-w-7xl flex-col gap-5 px-4 pb-8 pt-2 md:px-8 md:pb-10 lg:pl-32 lg:pr-10 lg:pt-8",
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
			<div className="rounded-[1.5rem] border border-border/70 bg-card/84 px-5 py-4 shadow-sm md:px-6">
				<div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
					<div className="space-y-2">
						{props.badge ? (
							<div className="inline-flex w-fit rounded-full bg-primary/8 px-2.5 py-1 font-medium text-primary text-[11px] uppercase tracking-[0.18em]">
								{props.badge}
							</div>
						) : null}
						<div className="space-y-1">
							<h1 className="font-semibold text-2xl tracking-tight md:text-3xl">
								{props.title}
							</h1>
							<p className="max-w-xl text-muted-foreground text-sm">
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
				<div className="rounded-[1.5rem] border border-border/70 bg-background/80 px-4 py-3 shadow-sm">
					{props.supportingPanel}
				</div>
			) : null}
		</header>
	);
}
