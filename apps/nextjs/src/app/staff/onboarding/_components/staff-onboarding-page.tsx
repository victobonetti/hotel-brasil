"use client";

import { Button } from "@nowait24/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@nowait24/ui/card";
import {
	Field,
	FieldContent,
	FieldDescription,
	FieldError,
	FieldGroup,
	FieldLabel,
	FieldTitle,
} from "@nowait24/ui/field";
import { Input } from "@nowait24/ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@nowait24/ui/select";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { startTransition, useMemo, useState } from "react";

import { PageShell } from "~/app/_components/page-shell";
import { ShieldIcon } from "~/app/_components/ui-icons";
import { useTRPC } from "~/trpc/react";
import {
	canAdvanceStaffOnboardingStep,
	createStaffOnboardingInitialData,
	createStaffOnboardingSlugSuggestion,
	getNextStaffOnboardingStep,
	getPreviousStaffOnboardingStep,
	STAFF_ONBOARDING_STEPS,
	type StaffOnboardingFormData,
	validateStaffOnboardingStep,
} from "./staff-onboarding-state";

const timezoneOptions = [
	{ label: "America/Sao_Paulo", value: "America/Sao_Paulo" },
	{ label: "America/Manaus", value: "America/Manaus" },
	{ label: "America/Fortaleza", value: "America/Fortaleza" },
];

const currencyOptions = [
	{ label: "BRL", value: "BRL" },
	{ label: "USD", value: "USD" },
	{ label: "EUR", value: "EUR" },
];

function StepBadge(props: {
	isActive: boolean;
	isComplete: boolean;
	label: string;
	step: string;
}) {
	return (
		<div
			className={`rounded-[1.35rem] border px-3 py-3 transition ${
				props.isActive
					? "border-primary/25 bg-primary/10"
					: "border-border/70 bg-background/70"
			}`}
		>
			<p className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
				{props.step}
			</p>
			<p className="mt-1 font-medium text-sm">
				{props.label}
				{props.isComplete ? " ok" : ""}
			</p>
		</div>
	);
}

function OverviewCard(props: {
	data: StaffOnboardingFormData;
	userName?: string;
}) {
	return (
		<Card className="border-border/70 bg-card/90 shadow-sm">
			<CardHeader>
				<CardTitle>Resumo do setup</CardTitle>
				<CardDescription>
					O primeiro hotel sera criado para {props.userName ?? "sua conta"} com
					perfil admin.
				</CardDescription>
			</CardHeader>
			<CardContent className="space-y-3 text-sm">
				<div className="rounded-[1.1rem] bg-background/80 px-3 py-3">
					<p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
						Hotel
					</p>
					<p className="mt-1 font-medium">
						{props.data.hotelName || "Defina o nome do hotel"}
					</p>
					<p className="mt-1 text-muted-foreground">
						/{props.data.slug || "slug-do-hotel"}
					</p>
				</div>
				<div className="grid gap-3 sm:grid-cols-2">
					<div className="rounded-[1.1rem] bg-background/80 px-3 py-3">
						<p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
							Contato
						</p>
						<p className="mt-1 font-medium">
							{props.data.phone || "Telefone pendente"}
						</p>
						<p className="mt-1 text-muted-foreground">
							{props.data.email || "Email pendente"}
						</p>
					</div>
					<div className="rounded-[1.1rem] bg-background/80 px-3 py-3">
						<p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
							Operacao
						</p>
						<p className="mt-1 font-medium">{props.data.currency}</p>
						<p className="mt-1 text-muted-foreground">{props.data.timezone}</p>
					</div>
				</div>
			</CardContent>
		</Card>
	);
}

export function StaffOnboardingPage(props: { userName?: string }) {
	const trpc = useTRPC();
	const router = useRouter();
	const [stepIndex, setStepIndex] = useState(0);
	const [data, setData] = useState(
		createStaffOnboardingInitialData(props.userName),
	);
	const [hasEditedSlug, setHasEditedSlug] = useState(false);
	const [submitError, setSubmitError] = useState<string | null>(null);
	const currentStep =
		STAFF_ONBOARDING_STEPS[stepIndex] ?? STAFF_ONBOARDING_STEPS[0];
	const stepErrors = useMemo(
		() => validateStaffOnboardingStep(stepIndex, data),
		[data, stepIndex],
	);
	const mutation = useMutation(
		trpc.staffOnboarding.createInitialHotel.mutationOptions({
			onError: (error) => {
				setSubmitError(error.message);
			},
			onSuccess: (result) => {
				setSubmitError(null);
				startTransition(() => {
					router.replace(result.redirectTo);
				});
			},
		}),
	);

	function updateField<K extends keyof StaffOnboardingFormData>(
		key: K,
		value: StaffOnboardingFormData[K],
	) {
		setData((current) => {
			const next = {
				...current,
				[key]: value,
			};

			if (key === "hotelName" && !hasEditedSlug) {
				next.slug = createStaffOnboardingSlugSuggestion(String(value));
			}

			return next;
		});
	}

	function goNext() {
		if (!canAdvanceStaffOnboardingStep(stepIndex, data)) {
			return;
		}

		setStepIndex((current) => getNextStaffOnboardingStep(current));
	}

	function goBack() {
		setStepIndex((current) => getPreviousStaffOnboardingStep(current));
	}

	async function handleSubmit() {
		if (Object.keys(validateStaffOnboardingStep(4, data)).length > 0) {
			setStepIndex(1);
			return;
		}

		await mutation.mutateAsync(data);
	}

	return (
		<PageShell className="bg-[radial-gradient(circle_at_top_left,color-mix(in_oklab,var(--primary)_10%,transparent)_0%,transparent_34%),linear-gradient(180deg,color-mix(in_oklab,var(--background)_97%,white_3%)_0%,var(--background)_100%)]">
			<header className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-start">
				<div className="rounded-[2rem] border border-border/70 bg-card/90 p-6 shadow-[0_26px_60px_-44px_rgba(25,18,15,0.28)]">
					<div className="flex items-start gap-4">
						<div className="flex size-12 items-center justify-center rounded-[1.2rem] bg-primary text-primary-foreground shadow-sm">
							<ShieldIcon className="size-5" />
						</div>
						<div className="space-y-3">
							<div>
								<p className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground">
									Onboarding do hotel
								</p>
								<h1 className="mt-1 font-semibold text-[2rem] tracking-tight">
									Configure o primeiro hotel e libere o painel.
								</h1>
							</div>
							<p className="max-w-2xl text-muted-foreground text-sm leading-6">
								Este setup inicial cria o hotel, vincula sua conta como admin e
								deixa o ambiente pronto para voce continuar com quartos e
								cardapio.
							</p>
						</div>
					</div>
				</div>
				<OverviewCard data={data} userName={props.userName} />
			</header>

			<div className="grid gap-6 lg:grid-cols-[260px_minmax(0,1fr)]">
				<Card className="border-border/70 bg-card/88 shadow-sm">
					<CardHeader>
						<CardTitle>Etapas</CardTitle>
						<CardDescription>
							Preencha o minimo necessario para colocar o hotel no ar.
						</CardDescription>
					</CardHeader>
					<CardContent className="grid gap-3">
						{STAFF_ONBOARDING_STEPS.map((step, index) => (
							<StepBadge
								isActive={index === stepIndex}
								isComplete={index < stepIndex}
								key={step.id}
								label={step.title}
								step={`0${index + 1}`}
							/>
						))}
					</CardContent>
				</Card>

				<Card className="border-border/70 bg-card/92 shadow-sm">
					<CardHeader>
						<CardTitle>{currentStep.title}</CardTitle>
						<CardDescription>{currentStep.description}</CardDescription>
					</CardHeader>
					<CardContent className="space-y-6">
						{stepIndex === 0 ? (
							<div className="grid gap-4 md:grid-cols-2">
								<div className="rounded-[1.4rem] border border-primary/15 bg-primary/8 p-4">
									<p className="font-medium text-sm">
										O que acontece ao concluir
									</p>
									<p className="mt-2 text-muted-foreground text-sm leading-6">
										Criamos o hotel, vinculamos sua conta como admin e abrimos o
										painel em seguida.
									</p>
								</div>
								<div className="rounded-[1.4rem] border border-border/70 bg-background/70 p-4">
									<p className="font-medium text-sm">O que fica para depois</p>
									<p className="mt-2 text-muted-foreground text-sm leading-6">
										Quartos, QR codes e cardapio continuam em etapas separadas
										para voce configurar no ritmo certo.
									</p>
								</div>
							</div>
						) : null}

						{stepIndex === 1 ? (
							<FieldGroup>
								<Field>
									<FieldLabel htmlFor="hotel-name">
										<FieldTitle>Nome do hotel</FieldTitle>
									</FieldLabel>
									<FieldContent>
										<Input
											id="hotel-name"
											onChange={(event) =>
												updateField("hotelName", event.target.value)
											}
											placeholder="Hotel Brasil"
											value={data.hotelName}
										/>
										<FieldDescription>
											Esse nome aparece no painel e nas futuras telas
											operacionais.
										</FieldDescription>
										<FieldError>{stepErrors.hotelName}</FieldError>
									</FieldContent>
								</Field>
								<Field>
									<FieldLabel htmlFor="hotel-slug">
										<FieldTitle>Slug do hotel</FieldTitle>
									</FieldLabel>
									<FieldContent>
										<Input
											id="hotel-slug"
											onChange={(event) => {
												setHasEditedSlug(true);
												updateField(
													"slug",
													createStaffOnboardingSlugSuggestion(
														event.target.value,
													),
												);
											}}
											placeholder="hotel-brasil"
											value={data.slug}
										/>
										<FieldDescription>
											Use apenas letras, numeros e hifens.
										</FieldDescription>
										<FieldError>{stepErrors.slug}</FieldError>
									</FieldContent>
								</Field>
							</FieldGroup>
						) : null}

						{stepIndex === 2 ? (
							<FieldGroup>
								<Field>
									<FieldLabel htmlFor="hotel-phone">
										<FieldTitle>Telefone ou WhatsApp</FieldTitle>
									</FieldLabel>
									<FieldContent>
										<Input
											id="hotel-phone"
											onChange={(event) =>
												updateField("phone", event.target.value)
											}
											placeholder="+55 11 99999-0000"
											value={data.phone}
										/>
										<FieldError>{stepErrors.phone}</FieldError>
									</FieldContent>
								</Field>
								<Field>
									<FieldLabel htmlFor="hotel-email">
										<FieldTitle>Email operacional</FieldTitle>
									</FieldLabel>
									<FieldContent>
										<Input
											id="hotel-email"
											onChange={(event) =>
												updateField("email", event.target.value)
											}
											placeholder="reservas@hotel.com"
											type="email"
											value={data.email}
										/>
										<FieldError>{stepErrors.email}</FieldError>
									</FieldContent>
								</Field>
							</FieldGroup>
						) : null}

						{stepIndex === 3 ? (
							<FieldGroup>
								<Field>
									<FieldLabel htmlFor="hotel-address">
										<FieldTitle>Endereco principal</FieldTitle>
									</FieldLabel>
									<FieldContent>
										<Input
											id="hotel-address"
											onChange={(event) =>
												updateField("addressLine", event.target.value)
											}
											placeholder="Av. Atlantica, 1000"
											value={data.addressLine}
										/>
										<FieldError>{stepErrors.addressLine}</FieldError>
									</FieldContent>
								</Field>
								<div className="grid gap-4 md:grid-cols-2">
									<Field>
										<FieldLabel htmlFor="hotel-city">
											<FieldTitle>Cidade</FieldTitle>
										</FieldLabel>
										<FieldContent>
											<Input
												id="hotel-city"
												onChange={(event) =>
													updateField("city", event.target.value)
												}
												placeholder="Rio de Janeiro"
												value={data.city}
											/>
											<FieldError>{stepErrors.city}</FieldError>
										</FieldContent>
									</Field>
									<Field>
										<FieldLabel htmlFor="hotel-state">
											<FieldTitle>Estado</FieldTitle>
										</FieldLabel>
										<FieldContent>
											<Input
												id="hotel-state"
												onChange={(event) =>
													updateField("state", event.target.value)
												}
												placeholder="RJ"
												value={data.state}
											/>
											<FieldError>{stepErrors.state}</FieldError>
										</FieldContent>
									</Field>
								</div>
								<Field>
									<FieldLabel htmlFor="hotel-country">
										<FieldTitle>Pais</FieldTitle>
									</FieldLabel>
									<FieldContent>
										<Input
											id="hotel-country"
											onChange={(event) =>
												updateField("country", event.target.value)
											}
											placeholder="Brasil"
											value={data.country}
										/>
										<FieldError>{stepErrors.country}</FieldError>
									</FieldContent>
								</Field>
							</FieldGroup>
						) : null}

						{stepIndex === 4 ? (
							<div className="grid gap-4 md:grid-cols-2">
								<Field>
									<FieldLabel>
										<FieldTitle>Fuso horario</FieldTitle>
									</FieldLabel>
									<FieldContent>
										<Select
											onValueChange={(value) =>
												updateField("timezone", value ?? "America/Sao_Paulo")
											}
											value={data.timezone}
										>
											<SelectTrigger className="w-full">
												<SelectValue />
											</SelectTrigger>
											<SelectContent>
												{timezoneOptions.map((option) => (
													<SelectItem key={option.value} value={option.value}>
														{option.label}
													</SelectItem>
												))}
											</SelectContent>
										</Select>
										<FieldError>{stepErrors.timezone}</FieldError>
									</FieldContent>
								</Field>
								<Field>
									<FieldLabel>
										<FieldTitle>Moeda</FieldTitle>
									</FieldLabel>
									<FieldContent>
										<Select
											onValueChange={(value) =>
												updateField("currency", value ?? "BRL")
											}
											value={data.currency}
										>
											<SelectTrigger className="w-full">
												<SelectValue />
											</SelectTrigger>
											<SelectContent>
												{currencyOptions.map((option) => (
													<SelectItem key={option.value} value={option.value}>
														{option.label}
													</SelectItem>
												))}
											</SelectContent>
										</Select>
										<FieldError>{stepErrors.currency}</FieldError>
									</FieldContent>
								</Field>
							</div>
						) : null}

						{stepIndex === 5 ? (
							<div className="grid gap-4 md:grid-cols-2">
								<div className="rounded-[1.4rem] border border-border/70 bg-background/70 p-4">
									<p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
										Identidade
									</p>
									<p className="mt-2 font-medium">{data.hotelName}</p>
									<p className="mt-1 text-muted-foreground">/{data.slug}</p>
								</div>
								<div className="rounded-[1.4rem] border border-border/70 bg-background/70 p-4">
									<p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
										Contato
									</p>
									<p className="mt-2 font-medium">{data.phone}</p>
									<p className="mt-1 text-muted-foreground">{data.email}</p>
								</div>
								<div className="rounded-[1.4rem] border border-border/70 bg-background/70 p-4">
									<p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
										Localizacao
									</p>
									<p className="mt-2 font-medium">{data.addressLine}</p>
									<p className="mt-1 text-muted-foreground">
										{data.city}, {data.state} - {data.country}
									</p>
								</div>
								<div className="rounded-[1.4rem] border border-border/70 bg-background/70 p-4">
									<p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
										Operacao
									</p>
									<p className="mt-2 font-medium">{data.currency}</p>
									<p className="mt-1 text-muted-foreground">{data.timezone}</p>
								</div>
							</div>
						) : null}

						{submitError ? (
							<div className="rounded-[1.2rem] border border-destructive/20 bg-destructive/5 px-4 py-3 text-destructive text-sm">
								{submitError}
							</div>
						) : null}

						<div className="flex flex-wrap items-center justify-between gap-3 border-border/60 border-t pt-4">
							<Button
								disabled={stepIndex === 0 || mutation.isPending}
								onClick={goBack}
								variant="outline"
							>
								Voltar
							</Button>
							<div className="flex flex-wrap gap-3">
								{stepIndex < STAFF_ONBOARDING_STEPS.length - 1 ? (
									<Button
										disabled={!canAdvanceStaffOnboardingStep(stepIndex, data)}
										onClick={goNext}
									>
										Continuar
									</Button>
								) : (
									<Button disabled={mutation.isPending} onClick={handleSubmit}>
										{mutation.isPending
											? "Criando hotel..."
											: "Criar hotel e abrir painel"}
									</Button>
								)}
							</div>
						</div>
					</CardContent>
				</Card>
			</div>
		</PageShell>
	);
}
