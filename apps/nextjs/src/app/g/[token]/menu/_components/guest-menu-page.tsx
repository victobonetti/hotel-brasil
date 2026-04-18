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
import { Card, CardContent } from "@nowait24/ui/card";
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
import { GuestSessionGuard } from "./guest-session-guard";

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

	const roomReference = menuQuery.data
		? formatRoomReference({
				roomId: menuQuery.data.guestSession.roomId,
				roomLabel: menuQuery.data.guestSession.roomLabel,
			})
		: "Seu quarto";

	return (
		<PageShell
			className="bg-[radial-gradient(circle_at_top,_rgba(217,77,56,0.14),_transparent_28%),linear-gradient(180deg,_#fff8f5_0%,_#fffdfb_54%,_#fff4ed_100%)]"
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

					<section className="rounded-[32px] border border-[#e8dfda] bg-white p-5 shadow-[0_24px_50px_-42px_rgba(86,59,52,0.22)]">
						<div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
							<div className="space-y-2">
								<p className="text-[#8b7069] text-sm">{roomReference}</p>
								<h1 className="font-semibold text-3xl text-[#2c1b19] tracking-tight">
									Cardapio
								</h1>
								<p className="max-w-xl text-[#7d6660] text-sm leading-6">
									Escolha os itens e toque para personalizar antes de adicionar.
								</p>
							</div>
							{totalItems > 0 ? (
								<div className="rounded-full border border-[#e7ddd8] bg-[#faf7f5] px-3 py-2 font-medium text-[#5e4742] text-sm">
									{totalItems} item(ns) na bandeja
								</div>
							) : null}
						</div>
					</section>

					<div className="grid gap-4 lg:grid-cols-[1.04fr_0.96fr] lg:items-start">
						<Card className="order-2 overflow-hidden rounded-[32px] border-[#efe0da] bg-[#fffdfb] shadow-[0_28px_60px_-44px_rgba(86,59,52,0.34)] lg:sticky lg:top-5 lg:order-1">
							<CardContent className="space-y-5 p-4">
								<div className="space-y-4 rounded-[28px] bg-[#fff7f3] p-4">
									<div className="flex items-start justify-between gap-3">
										<div className="space-y-1">
											<div className="inline-flex rounded-full bg-white px-3 py-1 font-medium text-[#b15a45] text-[11px] uppercase tracking-[0.2em]">
												Sua bandeja
											</div>
											<p className="font-semibold text-[#2c1b19] text-xl">
												Revise antes de enviar
											</p>
											<p className="text-[#7d6660] text-sm leading-6">
												Os itens escolhidos aparecem aqui para voce ajustar com
												calma antes da confirmacao.
											</p>
										</div>
										<Badge className="rounded-full border border-[#edd9d2] bg-white px-3 py-1 text-[#7d6660] shadow-none hover:bg-white">
											{totalItems} item(ns)
										</Badge>
									</div>
									<div className="grid grid-cols-2 gap-3">
										<div className="rounded-[22px] bg-white px-3 py-3">
											<p className="text-[#b15a45] text-[11px] uppercase tracking-[0.22em]">
												Total
											</p>
											<p className="mt-2 font-semibold text-[#2c1b19] text-sm">
												{formatPrice(totalValueInCents)}
											</p>
										</div>
										<div className="rounded-[22px] bg-white px-3 py-3">
											<p className="text-[#b15a45] text-[11px] uppercase tracking-[0.22em]">
												Itens
											</p>
											<p className="mt-2 font-semibold text-[#2c1b19] text-sm">
												{totalItems}
											</p>
										</div>
									</div>
								</div>

								{items.length > 0 ? (
									<div className="space-y-3">
										{items.map((item, index) => (
											<div
												className="flex items-start gap-3 rounded-[26px] border border-[#efe0da] bg-white p-4"
												key={`${item.menuItemId}-${index}`}
											>
												<div className="flex size-11 shrink-0 items-center justify-center rounded-full bg-[#fff1ec] font-semibold text-[#b15a45] text-sm">
													{item.quantity}x
												</div>
												<div className="min-w-0 flex-1 space-y-1">
													<p className="font-medium text-[#2c1b19] text-[15px]">
														{resolveMenuItem(item.menuItemId)?.name ??
															"Item do menu"}
													</p>
													<p className="text-[#7d6660] text-sm">
														{resolveMenuItem(item.menuItemId)
															? formatPrice(
																	(resolveMenuItem(item.menuItemId)
																		?.priceInCents ?? 0) * item.quantity,
																)
															: item.menuItemId}
													</p>
													<p className="text-[#8b7069] text-sm leading-6">
														{item.notes || "Sem observacoes neste item."}
													</p>
												</div>
												<Button
													className="rounded-full text-[#8b7069]"
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
									<div className="rounded-[26px] border border-[#eadad4] border-dashed bg-[#fffaf7] px-5 py-6">
										<p className="font-medium text-[#2c1b19]">
											Sua bandeja ainda esta vazia.
										</p>
										<p className="mt-2 text-[#7d6660] text-sm leading-6">
											Explore as categorias abaixo. Cada item pode ser ajustado
											antes de entrar no pedido.
										</p>
									</div>
								)}

								<Separator />

								<div className="space-y-2">
									<Label htmlFor="order-notes">Observacoes gerais</Label>
									<Textarea
										className="min-h-24 rounded-[22px] border-[#ecd9d3] bg-[#fffaf7]"
										id="order-notes"
										onChange={(event) => setOrderNotes(event.target.value)}
										placeholder="Ex.: bater na porta, deixar na bancada, alergias"
										value={orderNotes}
									/>
								</div>

								<div className="rounded-[26px] bg-[#241816] px-4 py-4 text-white">
									<div className="flex items-center justify-between gap-3">
										<div>
											<p className="text-[11px] uppercase tracking-[0.22em] text-white/58">
												Confirmacao
											</p>
											<p className="mt-1 text-sm text-white/78">
												Envie para o quarto quando estiver tudo certo.
											</p>
										</div>
										<p className="font-semibold text-xl">
											{formatPrice(totalValueInCents)}
										</p>
									</div>
									<Button
										className="mt-4 h-11 w-full rounded-full bg-[#d94d38] text-white shadow-[0_20px_36px_-22px_rgba(217,77,56,0.9)] hover:bg-[#c94330]"
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
							<section className="rounded-[32px] border border-[#efe0da] bg-[#fffdfb] p-4 shadow-[0_28px_60px_-44px_rgba(86,59,52,0.3)] sm:p-5">
								<div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
									<div className="space-y-2">
										<div className="inline-flex rounded-full bg-[#fff1ec] px-3 py-1 font-medium text-[#b15a45] text-xs uppercase tracking-[0.22em]">
											Menu
										</div>
										<div className="space-y-1">
											<h2 className="font-semibold text-2xl text-[#2c1b19] tracking-tight">
												Escolha por categoria
											</h2>
											<p className="max-w-2xl text-[#7d6660] text-sm leading-6 sm:text-base">
												Toque em um item para ver detalhes, ajustar quantidade e
												incluir observacoes.
											</p>
										</div>
									</div>
									<div className="rounded-full border border-[#f0ddd7] bg-white px-3 py-2 font-medium text-[#b15a45] text-sm shadow-[0_18px_32px_-28px_rgba(86,59,52,0.22)]">
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

				<div className="fixed inset-x-0 bottom-0 z-20 border-[#ebddd9] border-t bg-white/96 px-4 py-4 shadow-[0_-18px_48px_-32px_rgba(86,59,52,0.28)] md:hidden">
					<div className="mx-auto flex max-w-6xl items-center gap-3">
						<div className="min-w-0 flex-1">
							<p className="text-[#8b7069] text-[11px] uppercase tracking-[0.22em]">
								Revisao rapida
							</p>
							<p className="truncate font-semibold text-[#2c1b19] text-lg">
								{totalItems > 0
									? `${totalItems} item(ns) | ${formatPrice(totalValueInCents)}`
									: "Escolha itens para montar o pedido"}
							</p>
						</div>
						<Button
							className="h-11 rounded-full bg-[#d94d38] px-5 text-white shadow-[0_20px_36px_-22px_rgba(217,77,56,0.9)] hover:bg-[#c94330]"
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
					<AlertDialogContent className="max-w-md overflow-hidden rounded-[32px] border-[#efe0da] bg-[#fffdfb] p-0 sm:max-w-md">
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
										<div className="flex aspect-[4/3] w-full items-center justify-center bg-[linear-gradient(135deg,_#fff5ef,_#fee8de_55%,_#f8d4c0)]">
											<span className="rounded-full bg-white/88 px-4 py-2 font-medium text-[#b15a45] text-sm shadow-sm">
												Room service
											</span>
										</div>
									)}
									<Badge className="absolute top-4 left-4 rounded-full border-0 bg-white/94 px-3 py-1 text-[#402a25] shadow-none hover:bg-white/94">
										{formatPrice(selectedItem.priceInCents)}
									</Badge>
								</div>
								<div className="p-5">
									<AlertDialogHeader className="items-start text-left">
										<AlertDialogTitle className="text-left text-[#2c1b19] text-xl">
											{selectedItem.name}
										</AlertDialogTitle>
										<AlertDialogDescription className="text-left text-[#7d6660]">
											{selectedItem.description ??
												"Personalize este item antes de adicionar ao pedido."}
										</AlertDialogDescription>
									</AlertDialogHeader>

									<div className="mt-5 space-y-4">
										<div className="rounded-[24px] bg-[#fff7f3] px-4 py-3">
											<div className="flex items-center justify-between gap-3">
												<div>
													<p className="text-[#b15a45] text-[11px] uppercase tracking-[0.22em]">
														Entrega estimada
													</p>
													<p className="mt-1 font-semibold text-[#2c1b19] text-sm">
														{selectedItem.preparationTimeMinutes ?? 15} minutos
													</p>
												</div>
												<p className="font-semibold text-[#2c1b19] text-lg">
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
												className="h-12 rounded-[18px] border-[#ecd9d3] bg-[#fffaf7]"
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
												className="min-h-24 rounded-[18px] border-[#ecd9d3] bg-[#fffaf7]"
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
										<AlertDialogCancel className="rounded-full border-[#ead8d2] bg-[#fffaf7] text-[#3d2926] hover:bg-white">
											Cancelar
										</AlertDialogCancel>
										<AlertDialogAction
											className="h-11 rounded-full bg-[#d94d38] text-white shadow-[0_20px_36px_-22px_rgba(217,77,56,0.9)] hover:bg-[#c94330]"
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
