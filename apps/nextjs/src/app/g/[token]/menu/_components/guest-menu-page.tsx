"use client";

import { Badge } from "@finchat/ui/badge";
import { Button } from "@finchat/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@finchat/ui/card";
import { Label } from "@finchat/ui/label";
import { Separator } from "@finchat/ui/separator";
import { Textarea } from "@finchat/ui/textarea";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { PageShell, SectionHeader } from "~/app/_components/page-shell";
import { useTRPC } from "~/trpc/react";
import { CategorySection } from "./category-section";
import { GuestSessionGuard } from "./guest-session-guard";

function formatSessionExpiry(expiresAt: Date) {
	return new Intl.DateTimeFormat("pt-BR", {
		dateStyle: "short",
		timeStyle: "short",
	}).format(expiresAt);
}

function formatPrice(priceInCents: number) {
	return new Intl.NumberFormat("pt-BR", {
		currency: "BRL",
		style: "currency",
	}).format(priceInCents / 100);
}

export function GuestMenuPage(props: { guestSessionToken: string }) {
	const trpc = useTRPC();
	const router = useRouter();
	const menuQuery = useQuery(
		trpc.menu.getMenuForGuestSession.queryOptions({
			guestSessionToken: props.guestSessionToken,
		}),
	);
	const [items, setItems] = useState<
		Array<{ menuItemId: string; notes?: string; quantity: number }>
	>([]);
	const [orderNotes, setOrderNotes] = useState("");
	const createOrderMutation = useMutation(
		trpc.order.createOrderFromGuestSession.mutationOptions({
			onSuccess: (data) => {
				router.push(`/g/${props.guestSessionToken}/orders/${data.orderId}`);
			},
		}),
	);

	const totalItems = items.reduce((total, item) => total + item.quantity, 0);

	function resolveMenuItem(menuItemId: string) {
		return menuQuery.data?.categories
			.flatMap((category) => category.items)
			.find((candidate) => candidate.id === menuItemId);
	}

	const totalValueInCents = items.reduce((total, item) => {
		const menuItem = resolveMenuItem(item.menuItemId);
		return total + (menuItem?.priceInCents ?? 0) * item.quantity;
	}, 0);

	function handleAddItem(input: {
		menuItemId: string;
		notes?: string;
		quantity: number;
	}) {
		setItems((currentItems) => [...currentItems, input]);
	}

	return (
		<PageShell containerClassName="max-w-6xl gap-10">
			<GuestSessionGuard
				errorMessage={menuQuery.error?.message}
				isLoading={menuQuery.isLoading}
			>
				<div className="space-y-8">
					<SectionHeader
						badge="Menu digital"
						description="Escolha os itens do seu quarto, personalize observações e envie o pedido com a mesma praticidade de uma experiência premium de hospitalidade."
						title="Cardápio do quarto com pedido guiado"
					/>

					{menuQuery.data ? (
						<div className="grid gap-3 md:grid-cols-3">
							<Card className="border-primary/15 bg-card/88 backdrop-blur-sm" size="sm">
								<CardContent className="space-y-1 pt-4">
									<p className="font-medium text-primary text-sm">Quarto</p>
									<p className="font-semibold text-2xl">
										{menuQuery.data.guestSession.roomId}
									</p>
								</CardContent>
							</Card>
							<Card className="border-primary/15 bg-card/88 backdrop-blur-sm" size="sm">
								<CardContent className="space-y-1 pt-4">
									<p className="font-medium text-primary text-sm">Sessão ativa até</p>
									<p className="font-semibold text-lg">
										{formatSessionExpiry(menuQuery.data.guestSession.expiresAt)}
									</p>
								</CardContent>
							</Card>
							<Card className="border-primary/15 bg-card/88 backdrop-blur-sm" size="sm">
								<CardContent className="space-y-1 pt-4">
									<p className="font-medium text-primary text-sm">Itens no pedido</p>
									<p className="font-semibold text-2xl">{totalItems}</p>
								</CardContent>
							</Card>
						</div>
					) : null}

					<Card className="border-primary/15 bg-card/88 shadow-lg shadow-primary/10 backdrop-blur-sm">
						<CardHeader className="border-border/60 border-b">
							<div className="flex flex-wrap items-start justify-between gap-3">
								<div className="space-y-1">
									<CardTitle>Seu pedido</CardTitle>
									<CardDescription>
										Revise os itens selecionados antes de confirmar o envio.
									</CardDescription>
								</div>
								<Badge className="rounded-full px-3 py-1" variant="secondary">
									{totalItems} item(ns)
								</Badge>
							</div>
						</CardHeader>
						<CardContent className="space-y-5 pt-6">
							{items.length > 0 ? (
								<div className="space-y-3">
									{items.map((item, index) => (
										<div
											className="flex items-start justify-between gap-3 rounded-2xl border border-primary/10 bg-primary/[0.03] p-4"
											key={`${item.menuItemId}-${index}`}
										>
											<div className="space-y-1">
												<p className="font-medium">
													{item.quantity}x{" "}
													{resolveMenuItem(item.menuItemId)?.name ?? "Item do menu"}
												</p>
												<p className="text-muted-foreground text-sm">
													{resolveMenuItem(item.menuItemId)
														? formatPrice(
																(resolveMenuItem(item.menuItemId)?.priceInCents ?? 0) *
																	item.quantity,
															)
														: item.menuItemId}
												</p>
												{item.notes ? (
													<p className="text-muted-foreground text-sm">
														{item.notes}
													</p>
												) : null}
											</div>
											<Button
												onClick={() =>
													setItems((currentItems) =>
														currentItems.filter((_, itemIndex) => itemIndex !== index),
													)
												}
												size="sm"
												type="button"
												variant="ghost"
											>
												Remover
											</Button>
										</div>
									))}
								</div>
							) : (
								<div className="rounded-2xl border border-dashed border-primary/20 bg-primary/[0.03] px-5 py-6 text-muted-foreground text-sm">
									Nenhum item adicionado ainda. Use os cards abaixo para montar seu
									pedido.
								</div>
							)}

							<Separator />

							<div className="grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
								<div className="space-y-2">
									<Label htmlFor="order-notes">Observações gerais</Label>
									<Textarea
										id="order-notes"
										onChange={(event) => setOrderNotes(event.target.value)}
										placeholder="Ex.: bater na porta, deixar na bancada, alergias"
										value={orderNotes}
									/>
								</div>

								<div className="rounded-2xl border border-primary/10 bg-background/80 p-4">
									<p className="font-medium text-primary text-sm">Resumo rápido</p>
									<div className="mt-3 flex items-center justify-between text-sm">
										<span className="text-muted-foreground">Itens</span>
										<span className="font-medium">{totalItems}</span>
									</div>
									<div className="mt-2 flex items-center justify-between text-sm">
										<span className="text-muted-foreground">Estimativa atual</span>
										<span className="font-medium">
											{formatPrice(totalValueInCents)}
										</span>
									</div>
									<Button
										className="mt-4 w-full shadow-sm shadow-primary/20"
										disabled={items.length === 0 || createOrderMutation.isPending}
										onClick={() =>
											createOrderMutation.mutate({
												guestSessionToken: props.guestSessionToken,
												items,
												orderNotes: orderNotes.trim() || undefined,
											})
										}
										type="button"
									>
										{createOrderMutation.isPending
											? "Enviando pedido..."
											: "Confirmar pedido"}
									</Button>
								</div>
							</div>

							{createOrderMutation.error ? (
								<p className="text-destructive text-sm">
									{createOrderMutation.error.message}
								</p>
							) : null}
						</CardContent>
					</Card>

					<div className="space-y-8">
						{menuQuery.data?.categories.map((category) => (
							<CategorySection
								category={category}
								key={category.id}
								onAddItem={handleAddItem}
							/>
						))}
					</div>
				</div>
			</GuestSessionGuard>
		</PageShell>
	);
}
