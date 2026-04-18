"use client";

import { buttonVariants } from "@nowait24/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@nowait24/ui/card";
import { cn } from "@nowait24/ui/lib/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { GridIcon, PackageIcon, UtensilsIcon } from "./ui-icons";

export function getStaffNavItems() {
	return [
		{
			description: "Acompanhe a fila e avance cada pedido com clareza.",
			href: "/staff/orders" as const,
			label: "Pedidos",
		},
		{
			description: "Organize categorias e itens sem perder o contexto.",
			href: "/staff/menu" as const,
			label: "Cardapio",
		},
		{
			description: "Mantenha quartos e acessos publicos prontos para uso.",
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
		<Card className="overflow-hidden border-primary/15 bg-card/88 shadow-lg shadow-primary/10 backdrop-blur-sm">
			<CardHeader className="border-border/60 border-b bg-primary/[0.04]">
				<div className="space-y-3">
					<div className="inline-flex w-fit rounded-full border border-primary/15 bg-background/80 px-3 py-1 font-medium text-primary text-xs uppercase tracking-[0.18em]">
						Area da equipe
					</div>
					<div className="space-y-1.5">
						<CardTitle className="flex items-center gap-2">
							<GridIcon className="size-4" />
							Painel administrativo
						</CardTitle>
						<p className="text-muted-foreground text-sm">
							Escolha uma area e siga um fluxo por vez.
						</p>
					</div>
					<div className="rounded-2xl border border-primary/12 bg-background/80 p-3">
						<p className="font-medium text-sm">Agora voce esta em</p>
						<p className="mt-1 text-muted-foreground text-sm">
							{items.find((item) => isStaffNavItemActive(pathname, item.href))
								?.label ?? "Painel da equipe"}
						</p>
					</div>
				</div>
			</CardHeader>
			<CardContent className="space-y-4 pt-6">
				<div className="space-y-2">
					<p className="font-medium text-primary text-xs uppercase tracking-[0.18em]">
						Areas principais
					</p>
					{items.map((item) => {
						const isActive = isStaffNavItemActive(pathname, item.href);
						const Icon = icons[item.href];

						return (
							<Link
								className={cn(
									buttonVariants({
										className:
											"h-auto w-full justify-start rounded-[1.4rem] px-4 py-3.5 text-left shadow-sm",
										variant: isActive ? "default" : "outline",
									}),
									"flex-col items-start gap-2 whitespace-normal",
								)}
								href={item.href}
								key={item.href}
							>
								<span className="flex items-center gap-2">
									<span
										className={cn(
											"rounded-full p-1.5",
											isActive
												? "bg-primary-foreground/15"
												: "bg-primary/10 text-primary",
										)}
									>
										<Icon className="size-3.5" />
									</span>
									<span>{item.label}</span>
								</span>
								<span
									className={cn(
										"text-xs leading-5",
										isActive
											? "text-primary-foreground/80"
											: "text-muted-foreground",
									)}
								>
									{item.description}
								</span>
							</Link>
						);
					})}
				</div>
				<div className="rounded-2xl border border-primary/10 bg-primary/[0.03] p-4">
					<p className="font-medium text-sm">Ritmo recomendado</p>
					<p className="mt-1 text-muted-foreground text-sm leading-6">
						Primeiro acompanhe os pedidos, depois ajuste cardapio e quartos
						quando a operacao estiver tranquila.
					</p>
				</div>
			</CardContent>
		</Card>
	);
}
