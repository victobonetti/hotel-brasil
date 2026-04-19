"use client";

import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from "@nowait24/ui/alert-dialog";
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
import { cn } from "@nowait24/ui/lib/utils";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@nowait24/ui/select";
import { Textarea } from "@nowait24/ui/textarea";
import { useMutation, useQuery } from "@tanstack/react-query";
import type { Route } from "next";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import {
	ITEM_IMAGE_SIZE,
	processedImageDataUrlToFile,
	processMenuItemImage,
	uploadProcessedMenuItemImage,
} from "~/app/_components/item-image";
import { PageShell, SectionHeader } from "~/app/_components/page-shell";
import { PaginationControls } from "~/app/_components/pagination-controls";
import {
	buildPageSearch,
	parsePageParam,
	shouldSyncPageParam,
} from "~/app/_components/pagination-state";
import { formatPriceLabel, PriceField } from "~/app/_components/price-field";
import { StaffNav } from "~/app/_components/staff-nav";
import {
	ClockIcon,
	FolderIcon,
	ImageIcon,
	PlusIcon,
	RefreshIcon,
	TagIcon,
	ToggleOffIcon,
	ToggleOnIcon,
	TrashIcon,
} from "~/app/_components/ui-icons";
import { useTRPC } from "~/trpc/react";
import { StaffHotelGuard } from "../../../orders/_components/staff-hotel-guard";
import { getMenuItemLoadingState } from "./staff-menu-items-state";

function ItemImagePreview(props: { alt: string; src?: string | null }) {
	if (!props.src) {
		return (
			<div className="flex aspect-square w-24 items-center justify-center rounded-2xl border border-primary/20 border-dashed bg-primary/[0.03] text-center text-muted-foreground text-xs">
				Sem imagem
			</div>
		);
	}

	return (
		<Image
			alt={props.alt}
			className="aspect-square w-24 rounded-2xl border border-primary/10 object-cover shadow-primary/10 shadow-sm"
			height={ITEM_IMAGE_SIZE}
			src={props.src}
			width={ITEM_IMAGE_SIZE}
		/>
	);
}

export function StaffMenuItemsPage(props: {
	staffContext?: {
		hotelName: string;
		role: "admin" | "frontdesk" | "kitchen" | "manager";
		userName: string;
	} | null;
}) {
	const trpc = useTRPC();
	const pathname = usePathname();
	const router = useRouter();
	const searchParams = useSearchParams();
	const [name, setName] = useState("");
	const [description, setDescription] = useState("");
	const [categoryId, setCategoryId] = useState("");
	const [priceInCents, setPriceInCents] = useState(0);
	const [preparationTimeMinutes, setPreparationTimeMinutes] = useState("15");
	const [imageUrl, setImageUrl] = useState<string | null>(null);
	const [formError, setFormError] = useState<string | null>(null);
	const [itemActionError, setItemActionError] = useState<string | null>(null);
	const [isSubmittingCreateItem, setIsSubmittingCreateItem] = useState(false);
	const [pendingItemId, setPendingItemId] = useState<string | null>(null);
	const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
	const [itemDrafts, setItemDrafts] = useState<
		Record<
			string,
			{
				available: boolean;
				categoryId: string;
				description: string;
				imageUrl: string | null;
				name: string;
				preparationTimeMinutes: string;
				priceInCents: number;
			}
		>
	>({});
	const currentPage = parsePageParam(searchParams.get("page") ?? undefined);

	const categoryOptionsQuery = useQuery(
		trpc.catalogAdmin.listCategoryOptions.queryOptions(),
	);
	const itemsQuery = useQuery(
		trpc.catalogAdmin.listMenuItems.queryOptions({
			page: currentPage,
		}),
	);
	const createItemMutation = useMutation(
		trpc.catalogAdmin.createMenuItem.mutationOptions({
			onError: (error) => {
				setFormError(error.message);
			},
			onSuccess: () => {
				void itemsQuery.refetch();
				setName("");
				setDescription("");
				setCategoryId("");
				setPriceInCents(0);
				setPreparationTimeMinutes("15");
				setImageUrl(null);
				setFormError(null);
			},
		}),
	);
	const updateItemMutation = useMutation(
		trpc.catalogAdmin.updateMenuItem.mutationOptions({
			onError: (error) => {
				setItemActionError(error.message);
			},
			onSettled: () => {
				setPendingItemId(null);
			},
			onSuccess: () => {
				void itemsQuery.refetch();
				setItemActionError(null);
			},
		}),
	);

	let state: "loading" | "needs-auth" | "unauthorized" | undefined;
	if (categoryOptionsQuery.isLoading || itemsQuery.isLoading) {
		state = "loading";
	} else if (
		categoryOptionsQuery.error?.data?.code === "UNAUTHORIZED" ||
		itemsQuery.error?.data?.code === "UNAUTHORIZED"
	) {
		state = "needs-auth";
	} else if (categoryOptionsQuery.error || itemsQuery.error) {
		state = "unauthorized";
	}
	const items = itemsQuery.data?.items ?? [];
	const pagination = itemsQuery.data?.pagination;
	const selectedItem =
		selectedItemId === null
			? null
			: (items.find((item) => item.id === selectedItemId) ?? null);
	const selectedItemDraft =
		selectedItem === null
			? null
			: (itemDrafts[selectedItem.id] ?? {
					available: selectedItem.available,
					categoryId: selectedItem.categoryId,
					description: selectedItem.description ?? "",
					imageUrl: selectedItem.imageUrl ?? null,
					name: selectedItem.name,
					preparationTimeMinutes: String(
						selectedItem.preparationTimeMinutes ?? 15,
					),
					priceInCents: selectedItem.priceInCents,
				});

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

	const handleCreateImageChange = async (
		event: React.ChangeEvent<HTMLInputElement>,
	) => {
		const file = event.target.files?.[0];
		event.target.value = "";

		if (!file) {
			return;
		}

		try {
			setFormError(null);
			setImageUrl(await processMenuItemImage(file));
		} catch (error) {
			setFormError(
				error instanceof Error
					? error.message
					: "Nao foi possivel processar a imagem.",
			);
		}
	};

	const handleCreateItem = async () => {
		try {
			setIsSubmittingCreateItem(true);
			setFormError(null);

			const uploadedImage = imageUrl
				? await uploadProcessedMenuItemImage(
						processedImageDataUrlToFile(imageUrl),
					)
				: null;

			await createItemMutation.mutateAsync({
				categoryId,
				description: description.trim() || undefined,
				imageStorageKey: uploadedImage?.key,
				imageUrl: uploadedImage?.url,
				name: name.trim(),
				preparationTimeMinutes: Number(preparationTimeMinutes),
				priceInCents,
			});
		} catch (error) {
			setFormError(
				error instanceof Error
					? error.message
					: "Nao foi possivel salvar o item agora.",
			);
		} finally {
			setIsSubmittingCreateItem(false);
		}
	};

	const handleExistingItemImageChange = async (
		itemId: string,
		event: React.ChangeEvent<HTMLInputElement>,
	) => {
		const file = event.target.files?.[0];
		event.target.value = "";

		if (!file) {
			return;
		}

		try {
			setPendingItemId(itemId);
			setItemActionError(null);
			const processedImage = await processMenuItemImage(file);
			const uploadedImage = await uploadProcessedMenuItemImage(
				processedImageDataUrlToFile(processedImage),
			);
			setItemDrafts((currentDrafts) => ({
				...currentDrafts,
				[itemId]: {
					...(currentDrafts[itemId] ?? {
						available: true,
						categoryId: "",
						description: "",
						imageUrl: null,
						name: "",
						preparationTimeMinutes: "15",
						priceInCents: 0,
					}),
					imageUrl: uploadedImage.url,
				},
			}));
			await updateItemMutation.mutateAsync({
				imageStorageKey: uploadedImage.key,
				imageUrl: uploadedImage.url,
				itemId,
			});
		} catch (error) {
			setPendingItemId(null);
			setItemActionError(
				error instanceof Error
					? error.message
					: "Nao foi possivel processar a imagem.",
			);
		}
	};

	async function handleSaveSelectedItem() {
		if (!selectedItem || !selectedItemDraft) {
			return;
		}

		try {
			setPendingItemId(selectedItem.id);
			await updateItemMutation.mutateAsync({
				available: selectedItemDraft.available,
				categoryId: selectedItemDraft.categoryId,
				description: selectedItemDraft.description.trim() || undefined,
				imageStorageKey: selectedItemDraft.imageUrl ? undefined : "",
				imageUrl: selectedItemDraft.imageUrl ?? "",
				itemId: selectedItem.id,
				name: selectedItemDraft.name.trim(),
				preparationTimeMinutes: Number(
					selectedItemDraft.preparationTimeMinutes,
				),
				priceInCents: selectedItemDraft.priceInCents,
			});
			setSelectedItemId(null);
		} catch {
			// Error state already handled by mutation callbacks.
		}
	}

	return (
		<PageShell
			containerClassName="max-w-6xl gap-6"
			sidebar={<StaffNav context={props.staffContext} />}
		>
			<SectionHeader
				actions={
					<Button render={<Link href="/staff/menu" />} variant="outline">
						<RefreshIcon className="size-4" />
						Categorias
					</Button>
				}
				badge="Cardapio"
				description="Gerencie conteudo do cardapio com lista mais enxuta e detalhe acionavel para cada item."
				supportingPanel={
					<div className="space-y-0.5">
						<p className="font-medium text-sm">Padrao</p>
						<p className="text-muted-foreground text-sm">
							Nome curto. Imagem limpa.
						</p>
					</div>
				}
				title="Conteudo do cardapio"
			/>

			<StaffHotelGuard
				errorMessage={
					categoryOptionsQuery.error?.message ?? itemsQuery.error?.message
				}
				state={state}
			>
				<div className="grid gap-3 md:grid-cols-3">
					<div className="rounded-[1.4rem] border border-border/70 bg-card/90 p-5 shadow-sm">
						<p className="font-medium text-primary text-sm">Itens</p>
						<p className="mt-2 font-semibold text-3xl">
							{pagination?.totalItems ?? 0}
						</p>
					</div>
					<div className="rounded-[1.4rem] border border-border/70 bg-card/90 p-5 shadow-sm">
						<p className="font-medium text-primary text-sm">Disponiveis</p>
						<p className="mt-2 font-semibold text-3xl">
							{items.filter((item) => item.available).length}
						</p>
					</div>
					<div className="rounded-[1.4rem] border border-border/70 bg-card/90 p-5 shadow-sm">
						<p className="font-medium text-primary text-sm">Categorias</p>
						<p className="mt-2 font-semibold text-3xl">
							{categoryOptionsQuery.data?.length ?? 0}
						</p>
					</div>
				</div>

				<div className="grid gap-6 lg:grid-cols-[0.78fr_1.22fr]">
					<Card className="border-border/70 bg-card/90 shadow-sm">
						<CardHeader>
							<CardTitle>Novo item</CardTitle>
							<CardDescription>
								Cadastre o basico primeiro e publique com imagem quando
								precisar.
							</CardDescription>
						</CardHeader>
						<CardContent className="space-y-4">
							<div className="space-y-2">
								<Label htmlFor="item-name">Nome</Label>
								<Input
									id="item-name"
									onChange={(e) => setName(e.target.value)}
									value={name}
								/>
							</div>
							<div className="space-y-2">
								<Label htmlFor="item-description">Descricao</Label>
								<Textarea
									id="item-description"
									onChange={(e) => setDescription(e.target.value)}
									value={description}
								/>
							</div>
							<div className="space-y-2">
								<Label>Categoria</Label>
								<Select
									onValueChange={(value) => setCategoryId(value ?? "")}
									value={categoryId || null}
								>
									<SelectTrigger className="w-full">
										<SelectValue />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="">Selecione uma categoria</SelectItem>
										{categoryOptionsQuery.data?.map((category) => (
											<SelectItem key={category.id} value={category.id}>
												{category.name}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</div>
							<div className="grid gap-4 md:grid-cols-2">
								<div className="space-y-2">
									<Label htmlFor="item-price">Preco</Label>
									<PriceField
										id="item-price"
										onChange={setPriceInCents}
										valueInCents={priceInCents}
									/>
									<p className="text-muted-foreground text-xs">
										<TagIcon className="mr-1 inline size-3.5" />
										Valor final: {formatPriceLabel(priceInCents)}
									</p>
								</div>
								<div className="space-y-2">
									<Label htmlFor="item-prep-time">Preparo (min)</Label>
									<Input
										id="item-prep-time"
										onChange={(e) => setPreparationTimeMinutes(e.target.value)}
										type="number"
										value={preparationTimeMinutes}
									/>
								</div>
							</div>
							<div className="space-y-3">
								<Label htmlFor="item-image">Imagem do item</Label>
								<div className="flex flex-wrap items-start gap-4 rounded-2xl border border-primary/10 bg-primary/[0.03] p-4">
									<ItemImagePreview alt="Preview do novo item" src={imageUrl} />
									<div className="min-w-[220px] flex-1 space-y-3">
										<Input
											accept="image/*"
											className="sr-only"
											id="item-image"
											onChange={handleCreateImageChange}
											type="file"
										/>
										<p className="text-muted-foreground text-xs">
											Recorte automatico em 200x200.
										</p>
										<div className="flex flex-wrap gap-2">
											<Button
												render={
													<label
														className="cursor-pointer"
														htmlFor="item-image"
													>
														<span className="sr-only">
															Selecionar imagem do item
														</span>
													</label>
												}
												size="sm"
												variant={imageUrl ? "outline" : "default"}
											>
												<ImageIcon className="size-4" />
												{imageUrl ? "Trocar imagem" : "Enviar imagem"}
											</Button>
											{imageUrl ? (
												<Button
													onClick={() => setImageUrl(null)}
													size="sm"
													variant="outline"
												>
													<TrashIcon className="size-4" />
													Remover imagem
												</Button>
											) : null}
										</div>
									</div>
								</div>
							</div>
							{formError ? (
								<p className="text-destructive text-sm">{formError}</p>
							) : null}
							<div className="flex flex-wrap gap-3">
								<Button
									disabled={
										name.trim().length === 0 ||
										categoryId.length === 0 ||
										createItemMutation.isPending ||
										isSubmittingCreateItem
									}
									onClick={handleCreateItem}
								>
									<PlusIcon className="size-4" />
									Salvar item
								</Button>
								<Button render={<Link href="/staff/menu" />} variant="outline">
									<RefreshIcon className="size-4" />
									Categorias
								</Button>
							</div>
						</CardContent>
					</Card>

					<Card className="border-border/70 bg-card/90 shadow-sm">
						<CardHeader>
							<CardTitle>Lista de itens</CardTitle>
							<CardDescription>
								Visao geral dos itens ativos e acesso ao detalhe de cada
								registro.
							</CardDescription>
						</CardHeader>
						<CardContent className="space-y-3">
							{itemActionError ? (
								<p className="text-destructive text-sm">{itemActionError}</p>
							) : null}
							{items.map((item) => {
								const loadingState = getMenuItemLoadingState(
									pendingItemId,
									item.id,
								);

								return (
									<div
										className={cn(
											"relative flex flex-col gap-4 rounded-[1.25rem] border border-border/70 bg-background/60 p-4 transition-opacity",
											loadingState.itemClassName,
										)}
										key={item.id}
									>
										{loadingState.shouldShowOverlay ? (
											<div className="absolute inset-0 z-10 flex items-center justify-center rounded-2xl bg-background/55 backdrop-blur-[1px]">
												<div className="rounded-full border border-primary/20 bg-card px-3 py-1 font-medium text-primary text-xs shadow-sm">
													Carregando...
												</div>
											</div>
										) : null}
										<div className="flex flex-wrap items-start justify-between gap-3">
											<div className="flex min-w-0 items-start gap-3">
												<ItemImagePreview alt={item.name} src={item.imageUrl} />
												<div className="space-y-1">
													<p className="flex items-center gap-2 font-medium">
														<FolderIcon className="size-4 text-primary" />
														{item.name}
													</p>
													{item.description ? (
														<p className="text-muted-foreground text-sm">
															{item.description}
														</p>
													) : null}
													<p className="text-muted-foreground text-sm">
														<TagIcon className="mr-1 inline size-3.5" />
														{formatPriceLabel(item.priceInCents)}
														<span className="mx-2">-</span>
														<ClockIcon className="mr-1 inline size-3.5" />
														{item.preparationTimeMinutes ?? 15} min
													</p>
												</div>
											</div>
											<div className="flex flex-col items-end gap-2">
												<div className="rounded-full border border-border/70 bg-background/80 px-3 py-1 text-muted-foreground text-xs">
													{item.available ? "Disponivel" : "Indisponivel"}
												</div>
												<Button
													onClick={() => setSelectedItemId(item.id)}
													size="sm"
													variant="outline"
												>
													Gerenciar
												</Button>
											</div>
										</div>
										<div className="grid gap-2 sm:grid-cols-3">
											<div className="rounded-[1rem] bg-background/80 px-3 py-2">
												<p className="text-[11px] text-muted-foreground uppercase tracking-[0.18em]">
													Categoria
												</p>
												<p className="mt-1 text-sm">
													{categoryOptionsQuery.data?.find(
														(category) => category.id === item.categoryId,
													)?.name ?? "Categoria"}
												</p>
											</div>
											<div className="rounded-[1rem] bg-background/80 px-3 py-2">
												<p className="text-[11px] text-muted-foreground uppercase tracking-[0.18em]">
													Preco
												</p>
												<p className="mt-1 text-sm">
													{formatPriceLabel(item.priceInCents)}
												</p>
											</div>
											<div className="rounded-[1rem] bg-background/80 px-3 py-2">
												<p className="text-[11px] text-muted-foreground uppercase tracking-[0.18em]">
													Preparo
												</p>
												<p className="mt-1 text-sm">
													{item.preparationTimeMinutes ?? 15} min
												</p>
											</div>
										</div>
									</div>
								);
							})}
							{items.length === 0 ? (
								<div className="rounded-[1.25rem] border border-border/70 border-dashed bg-background/60 px-5 py-6 text-muted-foreground text-sm">
									Adicione o primeiro item.
								</div>
							) : null}
							{pagination ? (
								<PaginationControls pagination={pagination} />
							) : null}
						</CardContent>
					</Card>
				</div>
			</StaffHotelGuard>

			<AlertDialog
				onOpenChange={(open) => {
					if (!open) {
						setSelectedItemId(null);
						setItemActionError(null);
					}
				}}
				open={selectedItem !== null}
			>
				<AlertDialogContent className="max-w-2xl rounded-[30px] border-white/70 bg-white p-0 sm:max-w-2xl">
					{selectedItem && selectedItemDraft ? (
						<div className="space-y-0">
							<div className="border-border/60 border-b px-5 py-5">
								<AlertDialogHeader className="items-start text-left">
									<AlertDialogTitle>{selectedItem.name}</AlertDialogTitle>
									<AlertDialogDescription className="text-left">
										Edite os dados principais, disponibilidade e imagem deste
										item.
									</AlertDialogDescription>
								</AlertDialogHeader>
							</div>
							<div className="space-y-5 p-5">
								<div className="grid gap-5 md:grid-cols-[minmax(0,1fr)_220px]">
									<div className="space-y-4">
										<div className="grid gap-4 md:grid-cols-2">
											<div className="space-y-2">
												<Label htmlFor={`item-name-${selectedItem.id}`}>
													Nome
												</Label>
												<Input
													id={`item-name-${selectedItem.id}`}
													onChange={(event) =>
														setItemDrafts((currentDrafts) => ({
															...currentDrafts,
															[selectedItem.id]: {
																...selectedItemDraft,
																name: event.target.value,
															},
														}))
													}
													value={selectedItemDraft.name}
												/>
											</div>
											<div className="space-y-2">
												<Label>Categoria</Label>
												<Select
													onValueChange={(value) =>
														setItemDrafts((currentDrafts) => ({
															...currentDrafts,
															[selectedItem.id]: {
																...selectedItemDraft,
																categoryId: value,
															},
														}))
													}
													value={selectedItemDraft.categoryId}
												>
													<SelectTrigger className="w-full">
														<SelectValue />
													</SelectTrigger>
													<SelectContent>
														{categoryOptionsQuery.data?.map((category) => (
															<SelectItem key={category.id} value={category.id}>
																{category.name}
															</SelectItem>
														))}
													</SelectContent>
												</Select>
											</div>
										</div>
										<div className="space-y-2">
											<Label htmlFor={`item-description-${selectedItem.id}`}>
												Descricao
											</Label>
											<Textarea
												id={`item-description-${selectedItem.id}`}
												onChange={(event) =>
													setItemDrafts((currentDrafts) => ({
														...currentDrafts,
														[selectedItem.id]: {
															...selectedItemDraft,
															description: event.target.value,
														},
													}))
												}
												value={selectedItemDraft.description}
											/>
										</div>
										<div className="grid gap-4 md:grid-cols-2">
											<div className="space-y-2">
												<Label htmlFor={`item-price-${selectedItem.id}`}>
													Preco
												</Label>
												<PriceField
													id={`item-price-${selectedItem.id}`}
													onChange={(value) =>
														setItemDrafts((currentDrafts) => ({
															...currentDrafts,
															[selectedItem.id]: {
																...selectedItemDraft,
																priceInCents: value,
															},
														}))
													}
													valueInCents={selectedItemDraft.priceInCents}
												/>
											</div>
											<div className="space-y-2">
												<Label htmlFor={`item-prep-${selectedItem.id}`}>
													Preparo (min)
												</Label>
												<Input
													id={`item-prep-${selectedItem.id}`}
													onChange={(event) =>
														setItemDrafts((currentDrafts) => ({
															...currentDrafts,
															[selectedItem.id]: {
																...selectedItemDraft,
																preparationTimeMinutes: event.target.value,
															},
														}))
													}
													type="number"
													value={selectedItemDraft.preparationTimeMinutes}
												/>
											</div>
										</div>
									</div>
									<div className="space-y-4 rounded-[1.4rem] border border-border/70 bg-background/60 p-4">
										<ItemImagePreview
											alt={selectedItem.name}
											src={selectedItemDraft.imageUrl}
										/>
										<Input
											accept="image/*"
											className="sr-only"
											id={`item-image-${selectedItem.id}`}
											onChange={(event) =>
												handleExistingItemImageChange(selectedItem.id, event)
											}
											type="file"
										/>
										<div className="space-y-2">
											<p className="font-medium text-sm">Disponibilidade</p>
											<Button
												className="w-full"
												onClick={() =>
													setItemDrafts((currentDrafts) => ({
														...currentDrafts,
														[selectedItem.id]: {
															...selectedItemDraft,
															available: !selectedItemDraft.available,
														},
													}))
												}
												type="button"
												variant={
													selectedItemDraft.available ? "secondary" : "outline"
												}
											>
												{selectedItemDraft.available ? (
													<ToggleOffIcon className="size-4" />
												) : (
													<ToggleOnIcon className="size-4" />
												)}
												{selectedItemDraft.available
													? "Marcar indisponivel"
													: "Marcar disponivel"}
											</Button>
										</div>
										<div className="space-y-2">
											<Button
												className="w-full"
												render={
													<label
														className="cursor-pointer"
														htmlFor={`item-image-${selectedItem.id}`}
													>
														<span className="sr-only">
															Selecionar imagem para {selectedItem.name}
														</span>
													</label>
												}
												type="button"
												variant="outline"
											>
												<ImageIcon className="size-4" />
												{selectedItemDraft.imageUrl
													? "Trocar imagem"
													: "Enviar imagem"}
											</Button>
											<Button
												className="w-full"
												disabled={!selectedItemDraft.imageUrl}
												onClick={() =>
													setItemDrafts((currentDrafts) => ({
														...currentDrafts,
														[selectedItem.id]: {
															...selectedItemDraft,
															imageUrl: null,
														},
													}))
												}
												type="button"
												variant="outline"
											>
												<TrashIcon className="size-4" />
												Remover imagem
											</Button>
										</div>
									</div>
								</div>

								{itemActionError ? (
									<p className="text-destructive text-sm">{itemActionError}</p>
								) : null}

								<AlertDialogFooter>
									<AlertDialogCancel className="rounded-full">
										Fechar
									</AlertDialogCancel>
									<AlertDialogAction
										className="rounded-full"
										onClick={() => void handleSaveSelectedItem()}
									>
										Salvar alteracoes
									</AlertDialogAction>
								</AlertDialogFooter>
							</div>
						</div>
					) : null}
				</AlertDialogContent>
			</AlertDialog>
		</PageShell>
	);
}
