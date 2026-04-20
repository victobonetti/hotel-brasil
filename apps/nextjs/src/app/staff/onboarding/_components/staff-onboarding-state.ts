export interface StaffOnboardingFormData {
	addressLine: string;
	city: string;
	country: string;
	currency: string;
	email: string;
	hotelName: string;
	phone: string;
	slug: string;
	state: string;
	timezone: string;
}

export interface StaffOnboardingStep {
	description: string;
	id: "welcome" | "identity" | "contact" | "location" | "operations" | "review";
	title: string;
}

export const STAFF_ONBOARDING_STEPS: Array<StaffOnboardingStep> = [
	{
		description: "Entenda o setup inicial e o que sera liberado ao final.",
		id: "welcome",
		title: "Boas-vindas",
	},
	{
		description: "Defina o nome publico e o identificador do hotel.",
		id: "identity",
		title: "Identidade",
	},
	{
		description: "Cadastre os canais de contato principais.",
		id: "contact",
		title: "Contato",
	},
	{
		description: "Informe o endereco base da operacao.",
		id: "location",
		title: "Localizacao",
	},
	{
		description: "Ajuste moeda e fuso para o painel.",
		id: "operations",
		title: "Operacao",
	},
	{
		description: "Revise os dados antes de criar o hotel.",
		id: "review",
		title: "Revisao",
	},
];

export function createStaffOnboardingInitialData(
	userName?: string | null,
): StaffOnboardingFormData {
	const suggestedName = userName?.trim().length
		? `Hotel ${userName.trim()}`
		: "";

	return {
		addressLine: "",
		city: "",
		country: "Brasil",
		currency: "BRL",
		email: "",
		hotelName: suggestedName,
		phone: "",
		slug: suggestedName
			? createStaffOnboardingSlugSuggestion(suggestedName)
			: "",
		state: "",
		timezone: "America/Sao_Paulo",
	};
}

export function createStaffOnboardingSlugSuggestion(value: string) {
	return value
		.trim()
		.normalize("NFD")
		.replace(/[\u0300-\u036f]/g, "")
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, "-")
		.replace(/^-+|-+$/g, "")
		.replace(/-{2,}/g, "-");
}

function isBlank(value: string) {
	return value.trim().length === 0;
}

function isValidEmail(value: string) {
	return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

export function validateStaffOnboardingStep(
	stepIndex: number,
	data: StaffOnboardingFormData,
) {
	const errors: Partial<Record<keyof StaffOnboardingFormData, string>> = {};

	if (stepIndex >= 1) {
		if (isBlank(data.hotelName)) {
			errors.hotelName = "Informe o nome do hotel.";
		}

		if (createStaffOnboardingSlugSuggestion(data.slug).length < 3) {
			errors.slug = "Use um slug com pelo menos 3 caracteres validos.";
		}
	}

	if (stepIndex >= 2) {
		if (isBlank(data.phone)) {
			errors.phone = "Informe um telefone ou WhatsApp principal.";
		}

		if (!isValidEmail(data.email)) {
			errors.email = "Informe um email valido para o hotel.";
		}
	}

	if (stepIndex >= 3) {
		if (isBlank(data.addressLine)) {
			errors.addressLine = "Informe o endereco principal.";
		}
		if (isBlank(data.city)) {
			errors.city = "Informe a cidade.";
		}
		if (isBlank(data.state)) {
			errors.state = "Informe o estado.";
		}
		if (isBlank(data.country)) {
			errors.country = "Informe o pais.";
		}
	}

	if (stepIndex >= 4) {
		if (!data.timezone.includes("/")) {
			errors.timezone = "Selecione um fuso valido.";
		}
		if (!/^[A-Z]{3}$/.test(data.currency.trim().toUpperCase())) {
			errors.currency = "Use uma moeda em formato ISO de 3 letras.";
		}
	}

	return errors;
}

export function canAdvanceStaffOnboardingStep(
	stepIndex: number,
	data: StaffOnboardingFormData,
) {
	if (stepIndex === 0 || stepIndex >= STAFF_ONBOARDING_STEPS.length - 1) {
		return true;
	}

	return Object.keys(validateStaffOnboardingStep(stepIndex, data)).length === 0;
}

export function getNextStaffOnboardingStep(stepIndex: number) {
	return Math.min(stepIndex + 1, STAFF_ONBOARDING_STEPS.length - 1);
}

export function getPreviousStaffOnboardingStep(stepIndex: number) {
	return Math.max(stepIndex - 1, 0);
}
