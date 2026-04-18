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
				"min-h-screen bg-[radial-gradient(circle_at_top,_color-mix(in_oklab,var(--primary)_18%,transparent),_transparent_38%),linear-gradient(180deg,_color-mix(in_oklab,var(--background)_95%,white_5%),_var(--background))]",
				props.className,
			)}
		>
			<div
				className={cn(
					"mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 py-10 md:px-8 md:py-14",
					props.containerClassName,
				)}
			>
				{props.sidebar ? (
					<div className="grid gap-8 lg:grid-cols-[280px_minmax(0,1fr)] lg:items-start">
						<aside className={cn("lg:sticky lg:top-8", props.sidebarClassName)}>
							{props.sidebar}
						</aside>
						<div className="min-w-0">{props.children}</div>
					</div>
				) : (
					props.children
				)}
			</div>
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
		<header className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_320px] xl:items-start">
			<div className="rounded-[2rem] border border-primary/15 bg-card/80 p-6 shadow-primary/10 shadow-sm backdrop-blur-sm md:p-8">
				<div className="space-y-4">
					{props.badge ? (
						<div className="inline-flex w-fit rounded-full border border-primary/20 bg-primary/10 px-3 py-1 font-medium text-primary text-sm">
							{props.badge}
						</div>
					) : null}
					<div className="space-y-2">
						<h1 className="max-w-4xl font-semibold text-4xl tracking-tight md:text-5xl">
							{props.title}
						</h1>
						<p className="max-w-3xl text-base text-muted-foreground md:text-lg">
							{props.description}
						</p>
					</div>
					{props.actions ? (
						<div className="flex flex-wrap gap-3">{props.actions}</div>
					) : null}
				</div>
			</div>
			{props.supportingPanel ? props.supportingPanel : null}
		</header>
	);
}
