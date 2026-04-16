import { cn } from "@finchat/ui/lib/utils";

export function PageShell(props: {
	children: React.ReactNode;
	className?: string;
	containerClassName?: string;
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
				{props.children}
			</div>
		</main>
	);
}

export function SectionHeader(props: {
	badge?: string;
	description: string;
	title: string;
}) {
	return (
		<header className="space-y-4">
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
		</header>
	);
}
