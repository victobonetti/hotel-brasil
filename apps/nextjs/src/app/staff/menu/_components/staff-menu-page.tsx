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
import { useMutation, useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useState } from "react";

import { useTRPC } from "~/trpc/react";
import { StaffHotelGuard } from "../../orders/_components/staff-hotel-guard";

const DEFAULT_HOTEL_ID = "hotel-1";

export function StaffMenuPage() {
	const trpc = useTRPC();
	const [newCategoryName, setNewCategoryName] = useState("");
	const categoriesQuery = useQuery(
		trpc.catalogAdmin.listCategories.queryOptions({
			hotelId: DEFAULT_HOTEL_ID,
		}),
	);

	const createCategoryMutation = useMutation(
		trpc.catalogAdmin.createCategory.mutationOptions({
			onSuccess: () => {
				void categoriesQuery.refetch();
				setNewCategoryName("");
			},
		}),
	);
	const updateCategoryMutation = useMutation(
		trpc.catalogAdmin.updateCategory.mutationOptions({
			onSuccess: () => void categoriesQuery.refetch(),
		}),
	);
	const reorderMutation = useMutation(
		trpc.catalogAdmin.reorderCategories.mutationOptions({
			onSuccess: () => void categoriesQuery.refetch(),
		}),
	);

	const state = categoriesQuery.isLoading
		? "loading"
		: categoriesQuery.error?.data?.code === "UNAUTHORIZED"
			? "needs-auth"
			: categoriesQuery.error
				? "unauthorized"
				: undefined;

	return (
		<main className="min-h-screen bg-[linear-gradient(180deg,_rgba(248,250,252,1),_rgba(241,245,249,1))]">
			<div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 py-10 md:px-8 md:py-14">
				<header className="space-y-2">
					<p className="font-medium text-primary text-sm">Administração do catálogo</p>
					<h1 className="font-semibold text-4xl tracking-tight">
						Categorias do cardápio
					</h1>
					<p className="max-w-2xl text-muted-foreground">
						Crie, edite e reordene as categorias do menu do hotel.
					</p>
				</header>

				<StaffHotelGuard state={state}>
					<div className="grid gap-6 lg:grid-cols-[0.7fr_1.3fr]">
						<Card>
							<CardHeader>
								<CardTitle>Nova categoria</CardTitle>
								<CardDescription>
									Adicione uma nova seção ao cardápio do hotel.
								</CardDescription>
							</CardHeader>
							<CardContent className="space-y-4">
								<div className="space-y-2">
									<Label htmlFor="new-category">Nome da categoria</Label>
									<Input
										id="new-category"
										onChange={(event) => setNewCategoryName(event.target.value)}
										value={newCategoryName}
									/>
								</div>
								<Button
									disabled={
										newCategoryName.trim().length === 0 || createCategoryMutation.isPending
									}
									onClick={() =>
										createCategoryMutation.mutate({
											hotelId: DEFAULT_HOTEL_ID,
											name: newCategoryName.trim(),
										})
									}
								>
									Criar categoria
								</Button>
								<Button render={<Link href="/staff/menu/items" />} variant="outline">
									Gerenciar itens
								</Button>
							</CardContent>
						</Card>

						<Card>
							<CardHeader>
								<CardTitle>Ordem e edição</CardTitle>
								<CardDescription>
									Mantenha a estrutura do menu organizada para hóspedes e equipe.
								</CardDescription>
							</CardHeader>
							<CardContent className="space-y-3">
								{categoriesQuery.data?.map((category, index) => (
									<div
										className="flex flex-col gap-3 rounded-xl border border-border/60 p-4"
										key={category.id}
									>
										<div className="flex flex-wrap items-center justify-between gap-3">
											<div>
												<p className="font-medium">{category.name}</p>
												<p className="text-muted-foreground text-sm">
													Sort order {category.sortOrder}
												</p>
											</div>
											<div className="flex gap-2">
												<Button
													disabled={index === 0 || reorderMutation.isPending}
													onClick={() => {
														const ids = [...(categoriesQuery.data ?? [])].map((item) => item.id);
														const previousId = ids[index - 1];
														const currentId = ids[index];
														if (!previousId || !currentId) {
															return;
														}
														ids[index - 1] = currentId;
														ids[index] = previousId;
														reorderMutation.mutate({
															categoryIds: ids,
															hotelId: DEFAULT_HOTEL_ID,
														});
													}}
													size="sm"
													variant="outline"
												>
													Subir
												</Button>
												<Button
													disabled={
														index === (categoriesQuery.data?.length ?? 1) - 1 ||
														reorderMutation.isPending
													}
													onClick={() => {
														const ids = [...(categoriesQuery.data ?? [])].map((item) => item.id);
														const currentId = ids[index];
														const nextId = ids[index + 1];
														if (!currentId || !nextId) {
															return;
														}
														ids[index] = nextId;
														ids[index + 1] = currentId;
														reorderMutation.mutate({
															categoryIds: ids,
															hotelId: DEFAULT_HOTEL_ID,
														});
													}}
													size="sm"
													variant="outline"
												>
													Descer
												</Button>
											</div>
										</div>
										<div className="flex flex-wrap gap-2">
											<Button
												onClick={() =>
													updateCategoryMutation.mutate({
														active: !category.active,
														categoryId: category.id,
													})
												}
												size="sm"
												variant="secondary"
											>
												{category.active ? "Desativar" : "Ativar"}
											</Button>
										</div>
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
