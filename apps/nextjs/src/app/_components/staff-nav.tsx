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

export function StaffNav(props: {
	context?: {
		hotelName: string;
		role: "admin" | "frontdesk" | "kitchen" | "manager";
		userName: string;
	} | null;
}) {
	const pathname = usePathname();
	const items = getStaffNavItems();
	const icons = {
		"/staff/menu": GridIcon,
		"/staff/orders": UtensilsIcon,
		"/staff/rooms": PackageIcon,
	} as const;
	const currentItem =
		items.find((item) => isStaffNavItemActive(pathname, item.href)) ?? items[0];

	return (
		<>
			<div className="flex items-center gap-2 overflow-x-auto rounded-[1.4rem] border border-border/70 bg-card/92 p-2 shadow-sm lg:hidden">
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

			<div className="fixed inset-y-0 left-0 z-20 hidden w-64 border-border/70 border-r bg-background/94 px-5 py-6 lg:flex lg:flex-col">
				<div className="space-y-6">
					<div className="rounded-[1.6rem] border border-border/70 bg-card/90 p-4 shadow-sm">
						<div className="flex items-center gap-3">
							<div className="flex size-11 items-center justify-center rounded-[1.1rem] bg-primary text-primary-foreground shadow-sm">
								<GridIcon className="size-5" />
							</div>
							<div className="space-y-0.5">
								<p className="font-semibold text-sm tracking-[0.01em]">
									NoWait24
								</p>
								<p className="text-muted-foreground text-xs uppercase tracking-[0.18em]">
									Painel administrativo
								</p>
							</div>
						</div>
					</div>
					<div className="space-y-2">
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
													"h-auto w-full justify-start rounded-[1.25rem] border-0 px-3 py-3 shadow-none",
												variant: isActive ? "default" : "ghost",
											}),
											"gap-3",
										)}
										href={item.href}
										title={item.label}
									>
										<div className="flex size-9 items-center justify-center rounded-[0.9rem] bg-background/80">
											<Icon className="size-4.5" />
										</div>
										<div className="min-w-0 text-left">
											<p className="font-medium text-sm">{item.label}</p>
											<p className="text-xs opacity-70">{item.description}</p>
										</div>
									</Link>
									<div className="pointer-events-none absolute top-1/2 left-full ml-3 -translate-y-1/2 rounded-full border border-border/70 bg-background/96 px-3 py-1.5 font-medium text-[11px] text-foreground uppercase tracking-[0.16em] opacity-0 shadow-sm transition duration-150 group-hover:opacity-100 xl:hidden">
										{item.label}
									</div>
								</div>
							);
						})}
					</div>
				</div>

				<div className="mt-auto rounded-[1.5rem] border border-border/70 bg-card/82 px-4 py-4">
					<p className="text-[11px] text-muted-foreground uppercase tracking-[0.18em]">
						Agora
					</p>
					<p className="mt-1 font-medium text-sm">{currentItem?.label}</p>
					<p className="mt-1 text-muted-foreground text-sm leading-6">
						{currentItem?.description}
					</p>
					<div className="mt-4 rounded-[1.1rem] bg-background/80 px-3 py-3">
						<p className="text-[11px] text-muted-foreground uppercase tracking-[0.18em]">
							Conta ativa
						</p>
						<p className="mt-1 font-medium text-sm">
							{props.context?.hotelName ?? "Hotel vinculado"}
						</p>
						<p className="mt-1 text-muted-foreground text-xs leading-5">
							{props.context
								? `${props.context.userName} • ${props.context.role}`
								: "Admin conectado"}
						</p>
					</div>
				</div>
			</div>
		</>
	);
}
