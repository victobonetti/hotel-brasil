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

import { PageShell, SectionHeader } from "~/app/_components/page-shell";
import { useTRPC } from "~/trpc/react";
import { StaffHotelGuard } from "../../orders/_components/staff-hotel-guard";

export function StaffMenuPage() {
	const trpc = useTRPC();
	const [newCategoryName, setNewCategoryName] = useState("");
	const categoriesQuery = useQuery(trpc.catalogAdmin.listCategories.queryOptions());

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
		<PageShell containerClassName="max-w-6xl gap-8">
			<SectionHeader
				badge="Administração do catálogo"
				description="Organize as categorias do cardápio com uma estrutura mais clara para hóspedes e equipe."
				title="Categorias do cardápio"
			/>

			<StaffHotelGuard errorMessage={categoriesQuery.error?.message} state={state}>
				<div className="grid gap-6 lg:grid-cols-[0.7fr_1.3fr]">
					<Card className="border-primary/15 bg-card/88 shadow-sm shadow-primary/10">
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
									newCategoryName.trim().length === 0 ||
									createCategoryMutation.isPending
								}
								onClick={() =>
									createCategoryMutation.mutate({
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

					<Card className="border-primary/15 bg-card/88 shadow-sm shadow-primary/10">
						<CardHeader>
							<CardTitle>Ordem e edição</CardTitle>
							<CardDescription>
								Mantenha a estrutura do menu organizada para hóspedes e equipe.
							</CardDescription>
						</CardHeader>
						<CardContent className="space-y-3">
							{categoriesQuery.data?.map((category, index) => (
								<div
									className="flex flex-col gap-3 rounded-2xl border border-primary/10 bg-primary/[0.03] p-4"
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
													const ids = [...(categoriesQuery.data ?? [])].map(
														(item) => item.id,
													);
													const previousId = ids[index - 1];
													const currentId = ids[index];
													if (!previousId || !currentId) {
														return;
													}
													ids[index - 1] = currentId;
													ids[index] = previousId;
													reorderMutation.mutate({
														categoryIds: ids,
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
													const ids = [...(categoriesQuery.data ?? [])].map(
														(item) => item.id,
													);
													const currentId = ids[index];
													const nextId = ids[index + 1];
													if (!currentId || !nextId) {
														return;
													}
													ids[index] = nextId;
													ids[index + 1] = currentId;
													reorderMutation.mutate({
														categoryIds: ids,
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
										<div className="rounded-full border border-primary/15 bg-background/80 px-3 py-1 text-muted-foreground text-xs">
											Estado: {category.active ? "Ativa" : "Inativa"}
										</div>
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
							{(categoriesQuery.data?.length ?? 0) === 0 ? (
								<div className="rounded-2xl border border-dashed border-primary/20 bg-primary/[0.03] px-5 py-6 text-muted-foreground text-sm">
									Crie a primeira categoria para estruturar o cardápio do hotel.
								</div>
							) : null}
						</CardContent>
					</Card>
				</div>
			</StaffHotelGuard>
		</PageShell>
	);
}
