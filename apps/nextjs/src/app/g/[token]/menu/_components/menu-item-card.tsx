import { Badge } from "@finchat/ui/badge";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@finchat/ui/card";

import type { MenuItemView } from "@finchat/api";

function formatPrice(priceInCents: number) {
	return new Intl.NumberFormat("pt-BR", {
		currency: "BRL",
		style: "currency",
	}).format(priceInCents / 100);
}

export function MenuItemCard(props: { item: MenuItemView }) {
	return (
		<Card className="h-full border-border/60 bg-background/80 backdrop-blur-sm" size="sm">
			<CardHeader>
				<div className="flex items-start justify-between gap-3">
					<div className="space-y-1">
						<CardTitle>{props.item.name}</CardTitle>
						{props.item.description ? (
							<CardDescription>{props.item.description}</CardDescription>
						) : null}
					</div>
					<Badge variant="secondary">{formatPrice(props.item.priceInCents)}</Badge>
				</div>
			</CardHeader>
			<CardContent className="flex items-center justify-between gap-3 text-muted-foreground text-xs">
				<span>Entrega estimada</span>
				<span>{props.item.preparationTimeMinutes ?? 15} min</span>
			</CardContent>
		</Card>
	);
}
