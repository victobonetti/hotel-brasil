"use client";

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
import { Badge } from "@finchat/ui/badge";
import { useState } from "react";

import { useTRPC } from "~/trpc/react";
import { CategorySection } from "./category-section";
import { GuestSessionGuard } from "./guest-session-guard";

function formatSessionExpiry(expiresAt: Date) {
	return new Intl.DateTimeFormat("pt-BR", {
		dateStyle: "short",
		timeStyle: "short",
	}).format(expiresAt);
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

	function handleAddItem(input: {
		menuItemId: string;
		notes?: string;
		quantity: number;
	}) {
		setItems((currentItems) => [...currentItems, input]);
	}

	return (
		<main className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(14,165,233,0.16),_transparent_38%),linear-gradient(180deg,_rgba(255,255,255,1),_rgba(248,250,252,1))]">
			<div className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-4 py-10 md:px-8 md:py-14">
				<GuestSessionGuard
					errorMessage={menuQuery.error?.message}
					isLoading={menuQuery.isLoading}
				>
					<div className="space-y-8">
						<header className="space-y-4">
							<Badge variant="outline">Menu digital</Badge>
							<div className="space-y-2">
								<h1 className="font-semibold text-4xl tracking-tight md:text-5xl">
									Cardápio do quarto
								</h1>
								<p className="max-w-2xl text-base text-muted-foreground md:text-lg">
									Veja os itens disponíveis do seu hotel e acompanhe tudo sem
									precisar ligar para a recepção.
								</p>
							</div>

							{menuQuery.data ? (
								<div className="flex flex-wrap items-center gap-3 text-muted-foreground text-sm">
									<Badge variant="secondary">
										Quarto {menuQuery.data.guestSession.roomId}
									</Badge>
									<span>
										Sessão válida até{" "}
										{formatSessionExpiry(menuQuery.data.guestSession.expiresAt)}
									</span>
								</div>
							) : null}
						</header>

						<Card className="border-border/60 bg-background/80 backdrop-blur-sm">
							<CardHeader>
								<CardTitle>Seu pedido</CardTitle>
								<CardDescription>
									Revise os itens selecionados e confirme o envio para a cozinha.
								</CardDescription>
							</CardHeader>
							<CardContent className="space-y-4">
								{items.length > 0 ? (
									<div className="space-y-3">
										{items.map((item, index) => (
											<div
												className="flex items-start justify-between gap-3 rounded-xl border border-border/60 p-3"
												key={`${item.menuItemId}-${index}`}
											>
												<div className="space-y-1">
													<p className="font-medium">
														{item.quantity}x {item.menuItemId}
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
									<p className="text-muted-foreground text-sm">
										Nenhum item adicionado ainda.
									</p>
								)}

								<Separator />

								<div className="space-y-2">
									<Label htmlFor="order-notes">Observações gerais</Label>
									<Textarea
										id="order-notes"
										onChange={(event) => setOrderNotes(event.target.value)}
										placeholder="Ex.: bater na porta, deixar na bancada, alergias"
										value={orderNotes}
									/>
								</div>

								<div className="flex flex-wrap items-center justify-between gap-3">
									<p className="text-muted-foreground text-sm">
										{totalItems} item(ns) adicionados
									</p>
									<Button
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
			</div>
		</main>
	);
}
