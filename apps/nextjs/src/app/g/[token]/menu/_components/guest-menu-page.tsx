"use client";

import type { MenuItemView } from "@nowait24/api";
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogHeader,
	AlertDialogTitle,
} from "@nowait24/ui/alert-dialog";
import { Badge } from "@nowait24/ui/badge";
import { Button } from "@nowait24/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@nowait24/ui/card";
import { Input } from "@nowait24/ui/input";
import { Label } from "@nowait24/ui/label";
import { Separator } from "@nowait24/ui/separator";
import { Textarea } from "@nowait24/ui/textarea";
import { useMutation, useQuery } from "@tanstack/react-query";
import type { Route } from "next";
import Image from "next/image";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

import { formatRoomReference } from "~/app/_components/order-display";
import { PageShell } from "~/app/_components/page-shell";
import { PaginationControls } from "~/app/_components/pagination-controls";
import {
	buildPageSearch,
	parsePageParam,
	shouldSyncPageParam,
} from "~/app/_components/pagination-state";
import { useTRPC } from "~/trpc/react";
import { CategorySection } from "./category-section";
import { GuestMenuActions } from "./guest-menu-actions";
import { getGuestMenuHeroContent } from "./guest-menu-display";
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
	const pathname = usePathname();
	const router = useRouter();
	const searchParams = useSearchParams();
	const currentPage = parsePageParam(searchParams.get("page") ?? undefined);
	const menuQuery = useQuery(
		trpc.menu.getMenuForGuestSession.queryOptions({
			guestSessionToken: props.guestSessionToken,
			page: currentPage,
		}),
	);
	const availableItemsQuery = useQuery(
		trpc.menu.listAvailableItems.queryOptions({
			guestSessionToken: props.guestSessionToken,
		}),
	);
	const [items, setItems] = useState<
		Array<{ menuItemId: string; notes?: string; quantity: number }>
	>([]);
	const [orderNotes, setOrderNotes] = useState("");
	const [selectedItem, setSelectedItem] = useState<MenuItemView | null>(null);
	const [selectedItemNotes, setSelectedItemNotes] = useState("");
	const [selectedItemQuantity, setSelectedItemQuantity] = useState(1);
	const createOrderMutation = useMutation(
		trpc.order.createOrderFromGuestSession.mutationOptions({
			onSuccess: (data) => {
				router.push(`/g/${props.guestSessionToken}/orders/${data.orderId}`);
			},
		}),
	);

	const totalItems = items.reduce((total, item) => total + item.quantity, 0);
	const pagination = menuQuery.data?.pagination;

	useEffect(() => {
		if (!pagination || !shouldSyncPageParam(currentPage, pagination)) {
			return;
		}

		const nextSearch = buildPageSearch(
			new URLSearchParams(searchParams.toString()),
			"page",
			pagination.page,
		);
		router.replace(
			(nextSearch.length > 0 ? `${pathname}?${nextSearch}` : pathname) as Route,
			{
				scroll: false,
			},
		);
	}, [currentPage, pagination, pathname, router, searchParams]);

	useEffect(() => {
		if (!selectedItem) {
			return;
		}

		setSelectedItemQuantity(1);
		setSelectedItemNotes("");
	}, [selectedItem]);

	function resolveMenuItem(menuItemId: string) {
		return availableItemsQuery.data?.find(
			(candidate) => candidate.id === menuItemId,
		);
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

	function handleAddSelectedItem() {
		if (!selectedItem) {
			return;
		}

		handleAddItem({
			menuItemId: selectedItem.id,
			notes: selectedItemNotes.trim() || undefined,
			quantity: Math.max(1, selectedItemQuantity),
		});
		setSelectedItem(null);
	}

	const heroContent = getGuestMenuHeroContent(totalItems);
	const roomReference = menuQuery.data
		? formatRoomReference({
				roomId: menuQuery.data.guestSession.roomId,
				roomLabel: menuQuery.data.guestSession.roomLabel,
			})
		: "Seu quarto";
	const statCards = menuQuery.data
		? [
				{
					label: "Entrega",
					value: roomReference,
				},
				{
					label: "Sessao ativa ate",
					value: formatSessionExpiry(menuQuery.data.guestSession.expiresAt),
				},
				{
					label: "Categorias",
					value: `${menuQuery.data.pagination.totalItems} disponiveis`,
				},
				{
					label: "No pedido",
					value: totalItems > 0 ? `${totalItems} item(ns)` : "Nada adicionado",
				},
			]
		: [];

	return (
		<PageShell
			className="bg-[radial-gradient(circle_at_top,_rgba(234,29,44,0.18),_transparent_30%),linear-gradient(180deg,_#fff8f6_0%,_#fff_55%,_#fff4ef_100%)]"
			containerClassName="max-w-6xl gap-4 px-4 pb-32 pt-4 md:px-6 md:pb-16"
		>
			<GuestSessionGuard
				errorMessage={
					menuQuery.error?.message ?? availableItemsQuery.error?.message
				}
				isLoading={menuQuery.isLoading || availableItemsQuery.isLoading}
			>
				<div className="space-y-5">
					<GuestMenuActions guestSessionToken={props.guestSessionToken} />

					<section className="overflow-hidden rounded-[32px] bg-gradient-to-br from-[#ea1d2c] via-[#ff5a36] to-[#ff9f43] p-5 text-white shadow-[0_30px_90px_-36px_rgba(234,29,44,0.75)] md:p-6">
						<div className="space-y-5">
							<div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr] lg:items-start">
								<div className="space-y-3">
									<div className="inline-flex rounded-full bg-white/18 px-3 py-1 font-medium text-sm backdrop-blur">
										{heroContent.eyebrow}
									</div>
									<div className="space-y-2">
										<p className="text-sm text-white/80">{roomReference}</p>
										<h1 className="max-w-2xl font-semibold text-3xl leading-tight tracking-tight sm:text-4xl">
											{heroContent.title}
										</h1>
										<p className="max-w-xl text-sm text-white/82 sm:text-base">
											{heroContent.description}
										</p>
									</div>
								</div>
								<div className="rounded-[28px] bg-black/15 p-4 backdrop-blur-sm">
									<p className="text-white/70 text-xs uppercase tracking-[0.24em]">
										Como funciona
									</p>
									<div className="mt-3 space-y-3 text-sm text-white/86">
										<p>1. Escolha os itens no cardapio.</p>
										<p>2. Revise quantidade e observacoes.</p>
										<p>3. Confirme e acompanhe o status do pedido.</p>
									</div>
								</div>
							</div>

							<div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
								{statCards.map((card) => (
									<div
										className="rounded-[24px] border border-white/12 bg-white/10 px-3 py-3 backdrop-blur-sm"
										key={card.label}
									>
										<p className="text-white/72 text-xs uppercase tracking-[0.22em]">
											{card.label}
										</p>
										<p className="mt-2 font-semibold text-sm leading-snug sm:text-base">
											{card.value}
										</p>
									</div>
								))}
							</div>
						</div>
					</section>

					<div className="grid gap-4 lg:grid-cols-[0.94fr_1.06fr] lg:items-start">
						<Card className="order-2 overflow-hidden rounded-[28px] border-white/60 bg-white/90 shadow-[0_20px_70px_-30px_rgba(234,29,44,0.2)] backdrop-blur lg:sticky lg:top-5 lg:order-1">
							<CardHeader className="border-white/70 border-b bg-white/78">
								<div className="space-y-4">
									<div className="flex items-start justify-between gap-3">
										<div className="space-y-1">
											<CardTitle className="text-lg">
												Revise seu pedido
											</CardTitle>
											<CardDescription>
												Tudo o que voce escolher aparece aqui para revisao antes
												do envio.
											</CardDescription>
										</div>
										<Badge className="rounded-full border-0 bg-[#fff3f1] px-3 py-1 text-[#b42318] shadow-none hover:bg-[#fff3f1]">
											{totalItems} item(ns)
										</Badge>
									</div>
									<div className="grid grid-cols-2 gap-3">
										<div className="rounded-[22px] bg-[#fff6f4] p-3">
											<p className="text-[#b42318] text-xs uppercase tracking-[0.22em]">
												Total
											</p>
											<p className="mt-2 font-semibold text-slate-950 text-sm">
												{formatPrice(totalValueInCents)}
											</p>
										</div>
										<div className="rounded-[22px] bg-slate-100 p-3">
											<p className="text-slate-500 text-xs uppercase tracking-[0.22em]">
												Itens
											</p>
											<p className="mt-2 font-semibold text-slate-950 text-sm">
												{totalItems}
											</p>
										</div>
									</div>
								</div>
							</CardHeader>
							<CardContent className="space-y-5 pt-5">
								{items.length > 0 ? (
									<div className="space-y-3">
										{items.map((item, index) => (
											<div
												className="flex items-start gap-3 rounded-[24px] border border-[#f4d6d2] bg-[#fffaf9] p-4"
												key={`${item.menuItemId}-${index}`}
											>
												<div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-[#ea1d2c] font-semibold text-sm text-white">
													{item.quantity}x
												</div>
												<div className="min-w-0 flex-1 space-y-1">
													<p className="font-medium text-[15px]">
														{resolveMenuItem(item.menuItemId)?.name ??
															"Item do menu"}
													</p>
													<p className="text-muted-foreground text-sm">
														{resolveMenuItem(item.menuItemId)
															? formatPrice(
																	(resolveMenuItem(item.menuItemId)
																		?.priceInCents ?? 0) * item.quantity,
																)
															: item.menuItemId}
													</p>
													{item.notes ? (
														<p className="text-muted-foreground text-sm">
															{item.notes}
														</p>
													) : (
														<p className="text-muted-foreground text-sm">
															Sem observacoes neste item.
														</p>
													)}
												</div>
												<Button
													className="rounded-full"
													onClick={() =>
														setItems((currentItems) =>
															currentItems.filter(
																(_, itemIndex) => itemIndex !== index,
															),
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
									<div className="rounded-[24px] border border-[#f4d6d2] border-dashed bg-[#fffaf9] px-5 py-6">
										<p className="font-medium text-slate-950">
											Seu pedido ainda esta vazio.
										</p>
										<p className="mt-2 text-muted-foreground text-sm">
											Comece escolhendo uma categoria abaixo. Cada item pode ser
											personalizado antes de entrar no pedido.
										</p>
									</div>
								)}

								<Separator />

								<div className="space-y-2">
									<Label htmlFor="order-notes">Observacoes gerais</Label>
									<Textarea
										className="min-h-24 rounded-[22px] border-[#f0d5d2] bg-[#fffaf9]"
										id="order-notes"
										onChange={(event) => setOrderNotes(event.target.value)}
										placeholder="Ex.: bater na porta, deixar na bancada, alergias"
										value={orderNotes}
									/>
								</div>

								<div className="rounded-[24px] bg-slate-950 px-4 py-4 text-white">
									<div className="flex items-center justify-between gap-3">
										<div>
											<p className="text-white/70 text-xs uppercase tracking-[0.24em]">
												Confirmacao
											</p>
											<p className="mt-1 font-medium text-sm">
												Envie quando estiver tudo certo para o quarto.
											</p>
										</div>
										<p className="font-semibold text-xl">
											{formatPrice(totalValueInCents)}
										</p>
									</div>
									<Button
										className="mt-4 h-11 w-full rounded-full shadow-[0_16px_32px_-18px_rgba(234,29,44,0.9)]"
										disabled={
											items.length === 0 || createOrderMutation.isPending
										}
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

						<div className="order-1 space-y-5 lg:order-2">
							<section className="rounded-[28px] border border-white/65 bg-white/72 p-4 shadow-[0_18px_50px_-38px_rgba(15,23,42,0.28)] backdrop-blur sm:p-5">
								<div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
									<div className="space-y-2">
										<div className="inline-flex rounded-full bg-[#fff1ee] px-3 py-1 font-medium text-[#b42318] text-xs uppercase tracking-[0.22em]">
											Cardapio
										</div>
										<div className="space-y-1">
											<h2 className="font-semibold text-2xl text-slate-950 tracking-tight">
												Escolha por categoria
											</h2>
											<p className="max-w-2xl text-muted-foreground text-sm sm:text-base">
												Toque em um item para ver detalhes, ajustar quantidade e
												incluir observacoes.
											</p>
										</div>
									</div>
									<div className="rounded-full border border-[#f0d5d2] bg-[#fffaf9] px-3 py-2 font-medium text-[#b42318] text-sm shadow-sm">
										{menuQuery.data?.pagination.totalItems ?? 0} categoria(s)
									</div>
								</div>
							</section>

							{menuQuery.data?.categories.map((category) => (
								<CategorySection
									category={category}
									key={category.id}
									onSelectItem={setSelectedItem}
								/>
							))}
							{pagination ? (
								<PaginationControls pagination={pagination} />
							) : null}
						</div>
					</div>
				</div>

				<div className="fixed inset-x-0 bottom-0 z-20 border-[#f0d7d3] border-t bg-white/94 px-4 py-4 shadow-[0_-18px_48px_-32px_rgba(15,23,42,0.3)] backdrop-blur md:hidden">
					<div className="mx-auto flex max-w-6xl items-center gap-3">
						<div className="min-w-0 flex-1">
							<p className="text-muted-foreground text-xs uppercase tracking-[0.24em]">
								Revisao rapida
							</p>
							<p className="truncate font-semibold text-lg text-slate-950">
								{totalItems > 0
									? `${totalItems} item(ns) | ${formatPrice(totalValueInCents)}`
									: "Escolha itens para montar o pedido"}
							</p>
						</div>
						<Button
							className="h-11 rounded-full px-5 shadow-[0_16px_32px_-18px_rgba(234,29,44,0.9)]"
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
							{createOrderMutation.isPending ? "Enviando..." : "Enviar"}
						</Button>
					</div>
				</div>

				<AlertDialog
					onOpenChange={(open) => {
						if (!open) {
							setSelectedItem(null);
						}
					}}
					open={Boolean(selectedItem)}
				>
					<AlertDialogContent className="max-w-md overflow-hidden rounded-[30px] border-white/70 bg-white p-0 sm:max-w-md">
						{selectedItem ? (
							<>
								<div className="relative">
									{selectedItem.imageUrl ? (
										<Image
											alt={selectedItem.name}
											className="aspect-[4/3] w-full object-cover"
											height={320}
											src={selectedItem.imageUrl}
											width={420}
										/>
									) : (
										<div className="flex aspect-[4/3] w-full items-center justify-center bg-[linear-gradient(135deg,_#fff1ee,_#ffe6dc_55%,_#ffd4c4)]">
											<span className="rounded-full bg-white/85 px-4 py-2 font-medium text-[#b42318] text-sm shadow-sm">
												Room service
											</span>
										</div>
									)}
									<div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/52 via-black/10 to-transparent" />
									<Badge className="absolute top-4 left-4 rounded-full border-0 bg-white/92 px-3 py-1 text-slate-900 shadow-none hover:bg-white/92">
										{formatPrice(selectedItem.priceInCents)}
									</Badge>
								</div>
								<div className="p-5">
									<AlertDialogHeader className="items-start text-left">
										<AlertDialogTitle className="text-left text-slate-950 text-xl">
											{selectedItem.name}
										</AlertDialogTitle>
										<AlertDialogDescription className="text-left">
											{selectedItem.description ??
												"Personalize este item antes de adicionar ao pedido."}
										</AlertDialogDescription>
									</AlertDialogHeader>

									<div className="mt-5 space-y-4">
										<div className="rounded-[22px] bg-[#fff6f4] px-4 py-3">
											<div className="flex items-center justify-between gap-3">
												<div>
													<p className="text-[#b42318] text-xs uppercase tracking-[0.22em]">
														Entrega estimada
													</p>
													<p className="mt-1 font-semibold text-slate-950 text-sm">
														{selectedItem.preparationTimeMinutes ?? 15} minutos
													</p>
												</div>
												<p className="font-semibold text-lg text-slate-950">
													{formatPrice(
														selectedItem.priceInCents *
															Math.max(1, selectedItemQuantity),
													)}
												</p>
											</div>
										</div>

										<div className="space-y-2">
											<Label htmlFor="selected-item-quantity">Quantidade</Label>
											<Input
												className="h-12 rounded-[18px] border-[#f0d5d2] bg-[#fffaf9]"
												id="selected-item-quantity"
												min={1}
												onChange={(event) =>
													setSelectedItemQuantity(
														Math.max(1, Number(event.target.value || "1")),
													)
												}
												type="number"
												value={selectedItemQuantity}
											/>
										</div>

										<div className="space-y-2">
											<Label htmlFor="selected-item-notes">Observacoes</Label>
											<Textarea
												className="min-h-24 rounded-[18px] border-[#f0d5d2] bg-[#fffaf9]"
												id="selected-item-notes"
												onChange={(event) =>
													setSelectedItemNotes(event.target.value)
												}
												placeholder="Ex.: sem cebola, molho a parte"
												value={selectedItemNotes}
											/>
										</div>
									</div>

									<div className="mt-5 grid grid-cols-2 gap-3">
										<AlertDialogCancel className="rounded-full">
											Cancelar
										</AlertDialogCancel>
										<AlertDialogAction
											className="h-11 rounded-full shadow-[0_16px_32px_-18px_rgba(234,29,44,0.9)]"
											onClick={handleAddSelectedItem}
										>
											Adicionar
										</AlertDialogAction>
									</div>
								</div>
							</>
						) : null}
					</AlertDialogContent>
				</AlertDialog>
			</GuestSessionGuard>
		</PageShell>
	);
}
