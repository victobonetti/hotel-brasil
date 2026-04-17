"use client";

import { buttonVariants } from "@finchat/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@finchat/ui/card";
import { cn } from "@finchat/ui/lib/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { GridIcon, PackageIcon, UtensilsIcon } from "./ui-icons";

export function getStaffNavItems() {
	return [
		{
			description: "Fila ativa e andamento dos pedidos do hotel.",
			href: "/staff/orders" as const,
			label: "Pedidos",
		},
		{
			description: "Categorias, itens, disponibilidade e precos do cardapio.",
			href: "/staff/menu" as const,
			label: "Gerenciar cardapio",
		},
		{
			description: "Quartos, tokens e links publicos de acesso.",
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
		<Card className="border-primary/15 bg-card/88 shadow-lg shadow-primary/10 backdrop-blur-sm">
			<CardHeader>
				<CardTitle className="flex items-center gap-2">
					<GridIcon className="size-4" />
					Navegacao
				</CardTitle>
			</CardHeader>
			<CardContent className="space-y-2">
				{items.map((item) => {
					const isActive = isStaffNavItemActive(pathname, item.href);
					const Icon = icons[item.href];

					return (
						<Link
							className={cn(
								buttonVariants({
									className:
										"h-auto w-full justify-start rounded-2xl px-4 py-3 text-left shadow-sm",
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
									"text-xs",
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
			</CardContent>
		</Card>
	);
}
