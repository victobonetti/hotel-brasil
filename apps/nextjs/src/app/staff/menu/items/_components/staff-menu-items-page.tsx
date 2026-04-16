"use client";

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
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@finchat/ui/select";
import { Textarea } from "@finchat/ui/textarea";
import { useMutation, useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useState } from "react";

import { useTRPC } from "~/trpc/react";
import { StaffHotelGuard } from "../../../orders/_components/staff-hotel-guard";

const DEFAULT_HOTEL_ID = "hotel-1";

export function StaffMenuItemsPage() {
	const trpc = useTRPC();
	const [name, setName] = useState("");
	const [description, setDescription] = useState("");
	const [categoryId, setCategoryId] = useState("");
	const [priceInCents, setPriceInCents] = useState("0");
	const [preparationTimeMinutes, setPreparationTimeMinutes] = useState("15");

	const categoriesQuery = useQuery(
		trpc.catalogAdmin.listCategories.queryOptions({
			hotelId: DEFAULT_HOTEL_ID,
		}),
	);
	const itemsQuery = useQuery(
		trpc.catalogAdmin.listMenuItems.queryOptions({
			hotelId: DEFAULT_HOTEL_ID,
		}),
	);
	const createItemMutation = useMutation(
		trpc.catalogAdmin.createMenuItem.mutationOptions({
			onSuccess: () => {
				void itemsQuery.refetch();
				setName("");
				setDescription("");
				setCategoryId("");
				setPriceInCents("0");
				setPreparationTimeMinutes("15");
			},
		}),
	);
	const toggleItemMutation = useMutation(
		trpc.catalogAdmin.toggleMenuItemAvailability.mutationOptions({
			onSuccess: () => void itemsQuery.refetch(),
		}),
	);

	const state = categoriesQuery.isLoading || itemsQuery.isLoading
		? "loading"
		: categoriesQuery.error?.data?.code === "UNAUTHORIZED" ||
			  itemsQuery.error?.data?.code === "UNAUTHORIZED"
			? "needs-auth"
			: categoriesQuery.error || itemsQuery.error
				? "unauthorized"
				: undefined;

	return (
		<main className="min-h-screen bg-[linear-gradient(180deg,_rgba(248,250,252,1),_rgba(241,245,249,1))]">
			<div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 py-10 md:px-8 md:py-14">
				<header className="space-y-2">
					<p className="font-medium text-primary text-sm">Administração do catálogo</p>
					<h1 className="font-semibold text-4xl tracking-tight">Itens do cardápio</h1>
					<p className="max-w-2xl text-muted-foreground">
						Crie, edite e controle a disponibilidade dos itens do menu do hotel.
					</p>
				</header>

				<StaffHotelGuard state={state}>
					<div className="grid gap-6 lg:grid-cols-[0.78fr_1.22fr]">
						<Card>
							<CardHeader>
								<CardTitle>Novo item</CardTitle>
								<CardDescription>
									Adicione um item com categoria, preço e tempo de preparo.
								</CardDescription>
							</CardHeader>
							<CardContent className="space-y-4">
								<div className="space-y-2">
									<Label htmlFor="item-name">Nome</Label>
									<Input id="item-name" onChange={(e) => setName(e.target.value)} value={name} />
								</div>
								<div className="space-y-2">
									<Label htmlFor="item-description">Descrição</Label>
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
											{categoriesQuery.data?.map((category) => (
												<SelectItem key={category.id} value={category.id}>
													{category.name}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
								</div>
								<div className="grid gap-4 md:grid-cols-2">
									<div className="space-y-2">
										<Label htmlFor="item-price">Preço em centavos</Label>
										<Input
											id="item-price"
											onChange={(e) => setPriceInCents(e.target.value)}
											type="number"
											value={priceInCents}
										/>
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
								<div className="flex flex-wrap gap-3">
									<Button
										disabled={
											name.trim().length === 0 ||
											categoryId.length === 0 ||
											createItemMutation.isPending
										}
										onClick={() =>
											createItemMutation.mutate({
												categoryId,
												description: description.trim() || undefined,
												hotelId: DEFAULT_HOTEL_ID,
												name: name.trim(),
												preparationTimeMinutes: Number(preparationTimeMinutes),
												priceInCents: Number(priceInCents),
											})
										}
									>
										Criar item
									</Button>
									<Button render={<Link href="/staff/menu" />} variant="outline">
										Voltar às categorias
									</Button>
								</div>
							</CardContent>
						</Card>

						<Card>
							<CardHeader>
								<CardTitle>Itens existentes</CardTitle>
								<CardDescription>
									Controle disponibilidade e revise o catálogo ativo do hotel.
								</CardDescription>
							</CardHeader>
							<CardContent className="space-y-3">
								{itemsQuery.data?.map((item) => (
									<div
										className="flex flex-col gap-3 rounded-xl border border-border/60 p-4"
										key={item.id}
									>
										<div className="flex flex-wrap items-start justify-between gap-3">
											<div className="space-y-1">
												<p className="font-medium">{item.name}</p>
												{item.description ? (
													<p className="text-muted-foreground text-sm">
														{item.description}
													</p>
												) : null}
											</div>
											<Button
												onClick={() =>
													toggleItemMutation.mutate({
														itemId: item.id,
													})
												}
												size="sm"
												variant={item.available ? "secondary" : "outline"}
											>
												{item.available ? "Desativar" : "Ativar"}
											</Button>
										</div>
										<p className="text-muted-foreground text-sm">
											{item.priceInCents} centavos • {item.preparationTimeMinutes ?? 15} min
										</p>
									</div>
								))}
							</CardContent>
						</Card>
					</div>
				</StaffHotelGuard>
			</div>
		</main>
	);
}
