import type { MenuItemView } from "@finchat/api";
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

function formatPrice(priceInCents: number) {
	return new Intl.NumberFormat("pt-BR", {
		currency: "BRL",
		style: "currency",
	}).format(priceInCents / 100);
}

export function MenuItemCard(props: {
	item: MenuItemView;
	onAdd: (input: {
		menuItemId: string;
		notes?: string;
		quantity: number;
	}) => void;
}) {
	return (
		<Card
			className="h-full border-primary/15 bg-card/88 shadow-primary/10 shadow-sm backdrop-blur-sm"
			size="sm"
		>
			{props.item.imageUrl ? (
				<div className="border-border/60 border-b p-3">
					<img
						alt={props.item.name}
						className="aspect-square w-full rounded-2xl object-cover"
						height={200}
						src={props.item.imageUrl}
						width={200}
					/>
				</div>
			) : null}
			<CardHeader className="border-border/60 border-b">
				<div className="flex items-start justify-between gap-3">
					<div className="space-y-1">
						<CardTitle>{props.item.name}</CardTitle>
						{props.item.description ? (
							<CardDescription>{props.item.description}</CardDescription>
						) : null}
					</div>
					<Badge className="rounded-full px-3 py-1" variant="secondary">
						{formatPrice(props.item.priceInCents)}
					</Badge>
				</div>
			</CardHeader>
			<CardContent className="space-y-4 pt-4">
				<div className="flex items-center justify-between gap-3 rounded-xl bg-primary/[0.04] px-3 py-2 text-muted-foreground text-xs">
					<span>Entrega estimada</span>
					<span className="font-medium text-foreground">
						{props.item.preparationTimeMinutes ?? 15} min
					</span>
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
						<Label htmlFor={`notes-${props.item.id}`}>
							Observações do item
						</Label>
						<Textarea
							id={`notes-${props.item.id}`}
							name="notes"
							placeholder="Ex.: sem cebola, molho à parte"
						/>
					</div>
					<Button className="w-full shadow-primary/20 shadow-sm" type="submit">
						Adicionar ao pedido
					</Button>
				</form>
			</CardContent>
		</Card>
	);
}
