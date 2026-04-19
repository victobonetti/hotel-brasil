"use client";

import type { MenuItemView } from "@nowait24/api";
import { Badge } from "@nowait24/ui/badge";
import { Button } from "@nowait24/ui/button";
import { Label } from "@nowait24/ui/label";
import { Separator } from "@nowait24/ui/separator";
import { Textarea } from "@nowait24/ui/textarea";

import { PackageIcon, TrashIcon } from "~/app/_components/ui-icons";
import { getGuestCartContent } from "./guest-menu-display";

function formatPrice(priceInCents: number) {
	return new Intl.NumberFormat("pt-BR", {
		currency: "BRL",
		style: "currency",
	}).format(priceInCents / 100);
}

export function GuestCartCheckout(props: {
	createOrderErrorMessage?: string;
	isMobileFullscreen?: boolean;
	isSubmitting: boolean;
	items: Array<{ menuItemId: string; notes?: string; quantity: number }>;
	noteInputId: string;
	onClose?: () => void;
	onOrderNotesChange: (value: string) => void;
	onRemoveItem: (index: number) => void;
	onSubmit: () => void;
	orderNotes: string;
	resolveMenuItem: (menuItemId: string) => MenuItemView | undefined;
	showCloseButton?: boolean;
	totalItems: number;
	totalValueInCents: number;
}) {
	const cartContent = getGuestCartContent(props.totalItems);
	const isMobileFullscreen = props.isMobileFullscreen ?? false;

	return (
		<div className="flex h-dvh min-h-0 flex-col bg-[#fffdfb]">
			<div
				className={
					isMobileFullscreen
						? "sticky top-0 z-10 space-y-4 border-[#ecdcd6] border-b bg-[#fff7f2]/96 px-5 pt-[max(1.25rem,env(safe-area-inset-top))] pb-4 backdrop-blur-md"
						: "space-y-4 rounded-[30px] border border-[#ecdcd6] bg-[#fff7f2] p-4"
				}
			>
				<div className="flex items-start justify-between gap-3">
					<div className="space-y-2">
						<div className="inline-flex rounded-full bg-white px-3 py-1 font-medium text-[#b45a43] text-[11px] uppercase tracking-[0.2em]">
							Carrinho / checkout
						</div>
						<div className="space-y-1">
							<h2 className="font-semibold text-[#251613] text-xl">
								{cartContent.title}
							</h2>
							<p className="text-[#7d6761] text-sm leading-6">
								{cartContent.description}
							</p>
						</div>
					</div>
					<div className="flex items-center gap-2">
						<Badge className="rounded-full border border-[#edd9d2] bg-white px-3 py-1 text-[#6b524c] shadow-none hover:bg-white">
							{props.totalItems} item(ns)
						</Badge>
						{props.showCloseButton && props.onClose ? (
							<Button
								className="rounded-full border-[#e0c8c0] bg-white text-[#4c3732] hover:bg-[#fffaf7]"
								onClick={props.onClose}
								size="sm"
								type="button"
								variant="outline"
							>
								{isMobileFullscreen ? "Voltar ao menu" : "Fechar"}
							</Button>
						) : null}
					</div>
				</div>

				<div className="grid grid-cols-2 gap-3">
					<div className="rounded-[22px] bg-white px-3 py-3">
						<p className="text-[#b45a43] text-[11px] uppercase tracking-[0.22em]">
							Itens
						</p>
						<p className="mt-2 font-semibold text-[#251613] text-lg">
							{props.totalItems}
						</p>
					</div>
					<div className="rounded-[22px] bg-white px-3 py-3">
						<p className="text-[#b45a43] text-[11px] uppercase tracking-[0.22em]">
							Total
						</p>
						<p className="mt-2 font-semibold text-[#251613] text-lg">
							{formatPrice(props.totalValueInCents)}
						</p>
					</div>
				</div>
			</div>

			<div
				className={
					isMobileFullscreen
						? "min-h-0 flex-1 space-y-3 overflow-y-auto px-5 pt-5 pb-5"
						: "mt-5 flex-1 space-y-3 overflow-y-auto pr-1"
				}
			>
				{props.items.length > 0 ? (
					props.items.map((item, index) => {
						const menuItem = props.resolveMenuItem(item.menuItemId);

						return (
							<div
								className="rounded-[24px] border border-[#ead8d1] bg-white p-4"
								key={`${item.menuItemId}-${index}`}
							>
								<div className="flex items-start gap-3">
									<div className="flex size-11 shrink-0 items-center justify-center rounded-full bg-[#fff1ea] font-semibold text-[#b45a43] text-sm">
										{item.quantity}x
									</div>
									<div className="min-w-0 flex-1 space-y-1">
										<p className="font-medium text-[#251613] text-[15px]">
											{menuItem?.name ?? "Item do menu"}
										</p>
										<p className="text-[#5f4741] text-sm">
											{formatPrice(
												(menuItem?.priceInCents ?? 0) * item.quantity,
											)}
										</p>
										<p className="text-[#8a726c] text-sm leading-6">
											{item.notes || "Sem observacoes"}
										</p>
									</div>
									<Button
										aria-label="Remover item"
										className="rounded-full border-[#ead7d0] text-[#7f6660] hover:bg-[#fff6f2]"
										onClick={() => props.onRemoveItem(index)}
										size="icon-sm"
										title="Remover item"
										type="button"
										variant="outline"
									>
										<TrashIcon className="size-4" />
									</Button>
								</div>
							</div>
						);
					})
				) : (
					<div
						className={
							isMobileFullscreen
								? "flex min-h-[30dvh] items-center rounded-[28px] border border-[#ead8d1] border-dashed bg-[#fffaf7] px-5 py-6"
								: "rounded-[24px] border border-[#ead8d1] border-dashed bg-[#fffaf7] px-5 py-6"
						}
					>
						<div className="flex items-center gap-3">
							<div className="flex size-11 items-center justify-center rounded-full bg-white text-[#b45a43]">
								<PackageIcon className="size-4" />
							</div>
							<div className="space-y-1">
								<p className="font-medium text-[#251613]">
									Escolha algo no menu
								</p>
								<p className="text-[#7d6761] text-sm leading-6">
									Os itens adicionados aparecem aqui antes da finalizacao.
								</p>
							</div>
						</div>
					</div>
				)}
			</div>

			<div
				className={
					isMobileFullscreen
						? "sticky bottom-0 z-10 mt-auto space-y-4 border-[#ecdcd6] border-t bg-[#fffdfb]/98 px-5 pt-4 pb-[calc(1rem+env(safe-area-inset-bottom))] backdrop-blur-md"
						: "mt-5 space-y-4"
				}
			>
				<Separator />

				<div className="space-y-2">
					<Label htmlFor={props.noteInputId}>
						{isMobileFullscreen
							? "Observacoes gerais"
							: "Observacoes do pedido"}
					</Label>
					<Textarea
						className="min-h-24 rounded-[22px] border-[#ead8d1] bg-[#fffaf7]"
						id={props.noteInputId}
						onChange={(event) => props.onOrderNotesChange(event.target.value)}
						placeholder="Ex.: bater na porta, deixar na recepcao"
						value={props.orderNotes}
					/>
				</div>

				<div className="rounded-[26px] bg-[#201513] px-4 py-4 text-white">
					<div className="flex items-center justify-between gap-3">
						<div>
							<p className="text-[11px] text-white/58 uppercase tracking-[0.22em]">
								{isMobileFullscreen ? "Resumo do pedido" : "Checkout"}
							</p>
							<p className="mt-1 text-sm text-white/74">
								{isMobileFullscreen
									? "Revise tudo e envie para o hotel."
									: "Revise e envie para o hotel."}
							</p>
						</div>
						<p className="font-semibold text-xl">
							{formatPrice(props.totalValueInCents)}
						</p>
					</div>
					<Button
						className="mt-4 h-12 w-full rounded-full bg-[#d94d38] text-white shadow-[0_20px_36px_-22px_rgba(217,77,56,0.9)] hover:bg-[#c94330]"
						disabled={props.items.length === 0 || props.isSubmitting}
						onClick={props.onSubmit}
						type="button"
					>
						<PackageIcon className="size-4" />
						{props.isSubmitting ? "Finalizando..." : "Finalizar pedido"}
					</Button>
				</div>

				{props.createOrderErrorMessage ? (
					<p className="text-destructive text-sm">
						{props.createOrderErrorMessage}
					</p>
				) : null}
			</div>
		</div>
	);
}
