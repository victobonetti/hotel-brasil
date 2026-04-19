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
import {
	PackageIcon,
	PlusIcon,
	UtensilsIcon,
} from "~/app/_components/ui-icons";
import { useTRPC } from "~/trpc/react";
import { CategorySection } from "./category-section";
import { GuestCartCheckout } from "./guest-cart-checkout";
import { GuestMenuActions } from "./guest-menu-actions";
import {
	getGuestMenuHeroContent,
	getGuestMobileCartCtaLabel,
} from "./guest-menu-display";
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
	const [cartOpen, setCartOpen] = useState(false);
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
	const heroContent = getGuestMenuHeroContent(totalItems);

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

	function handleSubmitOrder() {
		createOrderMutation.mutate({
			guestSessionToken: props.guestSessionToken,
			items,
			orderNotes: orderNotes.trim() || undefined,
		});
	}

	const roomReference = menuQuery.data
		? formatRoomReference({
				roomId: menuQuery.data.guestSession.roomId,
				roomLabel: menuQuery.data.guestSession.roomLabel,
			})
		: "Seu quarto";

	return (
		<PageShell
			className="bg-[radial-gradient(circle_at_top,_rgba(219,88,49,0.12),_transparent_26%),linear-gradient(180deg,_#fff8f3_0%,_#fffdfb_52%,_#fff5ef_100%)]"
			containerClassName="max-w-7xl gap-4 px-4 pb-28 pt-4 md:px-6 md:pb-12"
		>
			<GuestSessionGuard
				errorMessage={
					menuQuery.error?.message ?? availableItemsQuery.error?.message
				}
				isLoading={menuQuery.isLoading || availableItemsQuery.isLoading}
			>
				<div className="space-y-4">
					<GuestMenuActions guestSessionToken={props.guestSessionToken} />

					<section className="rounded-[30px] border border-[#ecdfd9] bg-white px-4 py-5 shadow-[0_24px_50px_-42px_rgba(86,59,52,0.18)] sm:px-5">
						<div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
							<div className="space-y-3">
								<div className="inline-flex items-center gap-2 rounded-full bg-[#fff1e9] px-3 py-1 font-medium text-[#b45a43] text-[11px] uppercase tracking-[0.2em]">
									<UtensilsIcon className="size-3.5" />
									{heroContent.eyebrow}
								</div>
								<div className="space-y-1">
									<p className="text-[#886f68] text-sm">{roomReference}</p>
									<h1 className="font-semibold text-3xl text-[#251613] tracking-tight">
										{heroContent.title}
									</h1>
									<p className="max-w-2xl text-[#7b645d] text-sm leading-6">
										{heroContent.description}
									</p>
								</div>
							</div>
							<div className="flex items-center gap-2">
								<Badge className="rounded-full border border-[#ebddd7] bg-[#fffaf7] px-3 py-1 text-[#6b524c] shadow-none hover:bg-[#fffaf7]">
									{menuQuery.data?.pagination.totalItems ?? 0} categoria(s)
								</Badge>
								<Badge className="rounded-full border border-[#ebddd7] bg-[#fffaf7] px-3 py-1 text-[#6b524c] shadow-none hover:bg-[#fffaf7]">
									{totalItems} item(ns)
								</Badge>
							</div>
						</div>
					</section>

					<div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_24rem] xl:items-start">
						<div className="space-y-4">
							<section className="rounded-[30px] border border-[#efe0da] bg-[#fffdfb] p-4 shadow-[0_28px_60px_-44px_rgba(86,59,52,0.22)] sm:p-5">
								<div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
									<div className="space-y-1">
										<p className="font-semibold text-[#251613] text-xl">Menu</p>
										<p className="text-[#7b645d] text-sm leading-6">
											Escolha uma categoria, abra o item e envie para o
											carrinho.
										</p>
									</div>
									<div className="flex flex-wrap gap-2">
										{menuQuery.data?.categories.map((category) => (
											<a
												className="rounded-full border border-[#ebddd7] bg-white px-3 py-1.5 text-[#6b524c] text-xs"
												href={`#category-${category.id}`}
												key={category.id}
											>
												{category.name}
											</a>
										))}
									</div>
								</div>
							</section>

							{menuQuery.data?.categories.map((category) => (
								<div id={`category-${category.id}`} key={category.id}>
									<CategorySection
										category={category}
										onSelectItem={setSelectedItem}
									/>
								</div>
							))}
							{pagination ? (
								<PaginationControls pagination={pagination} />
							) : null}
						</div>

						<section className="hidden rounded-[32px] border border-[#eadbd5] bg-[#fffdfb] p-5 shadow-[0_30px_60px_-46px_rgba(86,59,52,0.24)] xl:sticky xl:top-5 xl:block">
							<GuestCartCheckout
								createOrderErrorMessage={createOrderMutation.error?.message}
								isSubmitting={createOrderMutation.isPending}
								items={items}
								noteInputId="desktop-order-notes"
								onOrderNotesChange={setOrderNotes}
								onRemoveItem={(index) =>
									setItems((currentItems) =>
										currentItems.filter((_, itemIndex) => itemIndex !== index),
									)
								}
								onSubmit={handleSubmitOrder}
								orderNotes={orderNotes}
								resolveMenuItem={resolveMenuItem}
								totalItems={totalItems}
								totalValueInCents={totalValueInCents}
							/>
						</section>
					</div>
				</div>

				<div className="fixed inset-x-0 bottom-0 z-20 border-[#ebddd9] border-t bg-white/96 px-4 py-4 shadow-[0_-18px_48px_-32px_rgba(86,59,52,0.28)] backdrop-blur xl:hidden">
					<div className="mx-auto flex max-w-7xl items-center gap-3">
						<div className="min-w-0 flex-1">
							<p className="text-[#8b7069] text-[11px] uppercase tracking-[0.22em]">
								Carrinho
							</p>
							<p className="truncate font-semibold text-[#251613] text-lg">
								{totalItems > 0
									? `${totalItems} item(ns) | ${formatPrice(totalValueInCents)}`
									: "Adicione itens para revisar"}
							</p>
						</div>
						<Button
							className="h-11 rounded-full bg-[#d94d38] px-5 text-white shadow-[0_20px_36px_-22px_rgba(217,77,56,0.9)] hover:bg-[#c94330]"
							onClick={() => setCartOpen(true)}
							type="button"
						>
							<PackageIcon className="size-4" />
							{getGuestMobileCartCtaLabel(totalItems)}
						</Button>
					</div>
				</div>

				<AlertDialog onOpenChange={setCartOpen} open={cartOpen}>
					<AlertDialogContent className="top-auto right-0 bottom-0 left-0 w-full max-w-none translate-x-0 translate-y-0 rounded-t-[32px] rounded-b-none border-[#ebddd7] bg-[#fffdfb] p-5 sm:max-w-none xl:hidden">
						<GuestCartCheckout
							createOrderErrorMessage={createOrderMutation.error?.message}
							isSubmitting={createOrderMutation.isPending}
							items={items}
							noteInputId="mobile-order-notes"
							onClose={() => setCartOpen(false)}
							onOrderNotesChange={setOrderNotes}
							onRemoveItem={(index) =>
								setItems((currentItems) =>
									currentItems.filter((_, itemIndex) => itemIndex !== index),
								)
							}
							onSubmit={handleSubmitOrder}
							orderNotes={orderNotes}
							resolveMenuItem={resolveMenuItem}
							showCloseButton
							totalItems={totalItems}
							totalValueInCents={totalValueInCents}
						/>
					</AlertDialogContent>
				</AlertDialog>

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
												Menu
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
												"Ajuste este item antes de adicionar ao carrinho."}
										</AlertDialogDescription>
									</AlertDialogHeader>

									<div className="mt-5 space-y-4">
										<div className="rounded-[24px] bg-[#fff7f3] px-4 py-3">
											<div className="flex items-center justify-between gap-3">
												<div>
													<p className="text-[#b15a45] text-[11px] uppercase tracking-[0.22em]">
														Preparo
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
											<label
												className="font-medium text-sm"
												htmlFor="selected-item-quantity"
											>
												Quantidade
											</label>
											<input
												className="flex h-12 w-full rounded-[18px] border border-[#ecd9d3] bg-[#fffaf7] px-3 py-2 text-base outline-none"
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
											<label
												className="font-medium text-sm"
												htmlFor="selected-item-notes"
											>
												Observacoes
											</label>
											<textarea
												className="flex min-h-24 w-full rounded-[18px] border border-[#ecd9d3] bg-[#fffaf7] px-3 py-2 text-base outline-none"
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
											<PlusIcon className="size-4" />
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
