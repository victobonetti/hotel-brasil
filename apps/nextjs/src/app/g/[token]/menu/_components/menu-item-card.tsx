import { Badge } from "@finchat/ui/badge";
import { Button } from "@finchat/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@finchat/ui/card";
import { Input } from "@finchat/ui/input";
import { Label } from "@finchat/ui/label";
import { Textarea } from "@finchat/ui/textarea";

import type { MenuItemView } from "@finchat/api";

function formatPrice(priceInCents: number) {
	return new Intl.NumberFormat("pt-BR", {
		currency: "BRL",
		style: "currency",
	}).format(priceInCents / 100);
}

export function MenuItemCard(props: {
	item: MenuItemView;
	onAdd: (input: { menuItemId: string; notes?: string; quantity: number }) => void;
}) {
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
			<CardContent className="space-y-4">
				<div className="flex items-center justify-between gap-3 text-muted-foreground text-xs">
					<span>Entrega estimada</span>
					<span>{props.item.preparationTimeMinutes ?? 15} min</span>
				</div>
				<form
					action={(formData) => {
						const quantity = Number(formData.get("quantity") ?? "1");
						const notes = String(formData.get("notes") ?? "").trim();
						props.onAdd({
							menuItemId: props.item.id,
							notes: notes.length > 0 ? notes : undefined,
							quantity,
						});
					}}
					className="space-y-3"
				>
					<div className="space-y-1">
						<Label htmlFor={`quantity-${props.item.id}`}>Quantidade</Label>
						<Input
							defaultValue={1}
							id={`quantity-${props.item.id}`}
							min={1}
							name="quantity"
							type="number"
						/>
					</div>
					<div className="space-y-1">
						<Label htmlFor={`notes-${props.item.id}`}>Observações do item</Label>
						<Textarea
							id={`notes-${props.item.id}`}
							name="notes"
							placeholder="Ex.: sem cebola, molho à parte"
						/>
					</div>
					<Button className="w-full" type="submit">
						Adicionar ao pedido
					</Button>
				</form>
			</CardContent>
		</Card>
	);
}
