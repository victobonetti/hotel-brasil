"use client";

import { buttonVariants } from "@nowait24/ui/button";
import { cn } from "@nowait24/ui/lib/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { GridIcon, PackageIcon, UtensilsIcon } from "./ui-icons";

export function getStaffNavItems() {
	return [
		{
			description: "Fila e andamento",
			href: "/staff/orders" as const,
			label: "Pedidos",
		},
		{
			description: "Categorias e itens",
			href: "/staff/menu" as const,
			label: "Cardapio",
		},
		{
			description: "Quartos e acesso",
			href: "/staff/rooms" as const,
			label: "Quartos",
		},
	];
}

export function isStaffNavItemActive(pathname: string, href: string) {
	return pathname === href || pathname.startsWith(`${href}/`);
}

export function StaffNav() {
	const pathname = usePathname();
	const items = getStaffNavItems();
	const icons = {
		"/staff/menu": GridIcon,
		"/staff/orders": UtensilsIcon,
		"/staff/rooms": PackageIcon,
	} as const;

	return (
		<>
			<div className="flex items-center gap-2 overflow-x-auto rounded-[1.4rem] border border-border/70 bg-card/88 p-2 shadow-sm lg:hidden">
				{items.map((item) => {
					const isActive = isStaffNavItemActive(pathname, item.href);
					const Icon = icons[item.href];

					return (
						<Link
							className={cn(
								buttonVariants({
									className: "h-11 min-w-0 rounded-[1rem] px-4 shadow-none",
									variant: isActive ? "default" : "ghost",
								}),
								"gap-2",
							)}
							href={item.href}
							key={item.href}
						>
							<Icon className="size-4" />
							<span>{item.label}</span>
						</Link>
					);
				})}
			</div>

			<div className="fixed inset-y-0 left-0 z-20 hidden w-24 border-border/70 border-r bg-background/94 lg:flex lg:flex-col lg:items-center lg:justify-between lg:py-6">
				<div className="flex flex-col items-center gap-4">
					<div className="flex size-12 items-center justify-center rounded-[1.35rem] bg-primary text-primary-foreground shadow-sm">
						<GridIcon className="size-5" />
					</div>
					<div className="flex flex-col items-center gap-3">
						{items.map((item) => {
							const isActive = isStaffNavItemActive(pathname, item.href);
							const Icon = icons[item.href];

							return (
								<div className="group relative" key={item.href}>
									<Link
										aria-label={item.label}
										className={cn(
											buttonVariants({
												className:
													"size-12 rounded-[1.25rem] border-0 px-0 shadow-none",
												variant: isActive ? "default" : "ghost",
											}),
										)}
										href={item.href}
										title={item.label}
									>
										<Icon className="size-4.5" />
										<span className="sr-only">{item.label}</span>
									</Link>
									<div className="pointer-events-none absolute top-1/2 left-full ml-3 -translate-y-1/2 rounded-full border border-border/70 bg-background/96 px-3 py-1.5 font-medium text-[11px] uppercase tracking-[0.16em] text-foreground opacity-0 shadow-sm transition duration-150 group-hover:opacity-100">
										{item.label}
									</div>
								</div>
							);
						})}
					</div>
				</div>

				<div className="flex flex-col items-center gap-2">
					<div className="text-muted-foreground text-[10px] uppercase tracking-[0.2em] [writing-mode:vertical-rl]">
						Hotel
					</div>
				</div>
			</div>
		</>
	);
}
