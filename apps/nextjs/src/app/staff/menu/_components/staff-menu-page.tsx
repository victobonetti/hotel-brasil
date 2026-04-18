"use client";

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
import { useMutation, useQuery } from "@tanstack/react-query";
import type { Route } from "next";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

import { PageShell, SectionHeader } from "~/app/_components/page-shell";
import { PaginationControls } from "~/app/_components/pagination-controls";
import {
	buildPageSearch,
	parsePageParam,
	shouldSyncPageParam,
} from "~/app/_components/pagination-state";
import { StaffNav } from "~/app/_components/staff-nav";
import {
	ArrowDownIcon,
	ArrowUpIcon,
	PackageIcon,
	PlusIcon,
	ToggleOffIcon,
	ToggleOnIcon,
} from "~/app/_components/ui-icons";
import { useTRPC } from "~/trpc/react";
import { StaffHotelGuard } from "../../orders/_components/staff-hotel-guard";

export function StaffMenuPage() {
	const trpc = useTRPC();
	const pathname = usePathname();
	const router = useRouter();
	const searchParams = useSearchParams();
	const [newCategoryName, setNewCategoryName] = useState("");
	const currentPage = parsePageParam(searchParams.get("page") ?? undefined);
	const categoriesQuery = useQuery(
		trpc.catalogAdmin.listCategories.queryOptions({
			page: currentPage,
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

	let state: "loading" | "needs-auth" | "unauthorized" | undefined;
	if (categoriesQuery.isLoading) {
		state = "loading";
	} else if (categoriesQuery.error?.data?.code === "UNAUTHORIZED") {
		state = "needs-auth";
	} else if (categoriesQuery.error) {
		state = "unauthorized";
	}
	const categories = categoriesQuery.data?.items ?? [];
	const pagination = categoriesQuery.data?.pagination;

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

	return (
		<PageShell containerClassName="max-w-6xl gap-8" sidebar={<StaffNav />}>
			<SectionHeader
				badge="Administracao do catalogo"
				description="Organize as categorias do cardapio com uma estrutura mais clara para hospedes e equipe."
				title="Categorias do cardapio"
			/>

			<StaffHotelGuard
				errorMessage={categoriesQuery.error?.message}
				state={state}
			>
				<div className="grid gap-6 lg:grid-cols-[0.7fr_1.3fr]">
					<Card className="border-primary/15 bg-card/88 shadow-primary/10 shadow-sm">
						<CardHeader>
							<CardTitle>Nova categoria</CardTitle>
							<CardDescription>
								Adicione uma nova secao ao cardapio do hotel.
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
								<PlusIcon className="size-4" />
								Criar categoria
							</Button>
							<Button
								render={<Link href="/staff/menu/items" />}
								variant="outline"
							>
								<PackageIcon className="size-4" />
								Gerenciar itens
							</Button>
						</CardContent>
					</Card>

					<Card className="border-primary/15 bg-card/88 shadow-primary/10 shadow-sm">
						<CardHeader>
							<CardTitle>Ordem e edicao</CardTitle>
							<CardDescription>
								Mantenha a estrutura do menu organizada para hospedes e equipe.
							</CardDescription>
						</CardHeader>
						<CardContent className="space-y-3">
							{categories.map((category, index) => (
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
													const ids = categories.map((item) => item.id);
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
												<ArrowUpIcon className="size-4" />
												Subir
											</Button>
											<Button
												disabled={
													index === categories.length - 1 ||
													reorderMutation.isPending
												}
												onClick={() => {
													const ids = categories.map((item) => item.id);
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
												<ArrowDownIcon className="size-4" />
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
											{category.active ? (
												<ToggleOffIcon className="size-4" />
											) : (
												<ToggleOnIcon className="size-4" />
											)}
											{category.active ? "Desativar" : "Ativar"}
										</Button>
									</div>
								</div>
							))}
							{categories.length === 0 ? (
								<div className="rounded-2xl border border-primary/20 border-dashed bg-primary/[0.03] px-5 py-6 text-muted-foreground text-sm">
									Crie a primeira categoria para estruturar o cardapio do hotel.
								</div>
							) : null}
							{pagination ? (
								<PaginationControls pagination={pagination} />
							) : null}
						</CardContent>
					</Card>
				</div>
			</StaffHotelGuard>
		</PageShell>
	);
}
