import type { MenuCategoryWithItems } from "@finchat/api";

import { MenuItemCard } from "./menu-item-card";

export function CategorySection(props: { category: MenuCategoryWithItems }) {
	return (
		<section className="space-y-5">
			<div className="space-y-1">
				<h2 className="font-semibold text-2xl tracking-tight">{props.category.name}</h2>
				{props.category.description ? (
					<p className="max-w-2xl text-muted-foreground">
						{props.category.description}
					</p>
				) : null}
			</div>

			{props.category.items.length > 0 ? (
				<div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
					{props.category.items.map((item) => (
						<MenuItemCard item={item} key={item.id} />
					))}
				</div>
			) : (
				<div className="rounded-2xl border border-dashed border-border/70 bg-muted/30 px-5 py-6 text-muted-foreground text-sm">
					Não há itens disponíveis nesta categoria no momento.
				</div>
			)}
		</section>
	);
}
