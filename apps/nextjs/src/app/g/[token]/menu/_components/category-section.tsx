import type { MenuCategoryWithItems } from "@finchat/api";

import { MenuItemCard } from "./menu-item-card";

export function CategorySection(props: {
	category: MenuCategoryWithItems;
	onAddItem: (input: {
		menuItemId: string;
		notes?: string;
		quantity: number;
	}) => void;
}) {
	return (
		<section className="space-y-5">
			<div className="flex items-end justify-between gap-3">
				<div className="space-y-1">
					<h2 className="font-semibold text-2xl tracking-tight">
						{props.category.name}
					</h2>
					{props.category.description ? (
						<p className="max-w-2xl text-muted-foreground">
							{props.category.description}
						</p>
					) : null}
				</div>
				<div className="rounded-full border border-primary/15 bg-primary/[0.05] px-3 py-1 font-medium text-primary text-xs">
					{props.category.items.length} item(ns)
				</div>
			</div>

			{props.category.items.length > 0 ? (
				<div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
					{props.category.items.map((item) => (
						<MenuItemCard item={item} key={item.id} onAdd={props.onAddItem} />
					))}
				</div>
			) : (
				<div className="rounded-2xl border border-primary/20 border-dashed bg-primary/[0.03] px-5 py-6 text-muted-foreground text-sm">
					Não há itens disponíveis nesta categoria no momento.
				</div>
			)}
		</section>
	);
}
