import { CatalogAdminServiceError } from "./services/catalog-admin-service";
import { GuestSessionServiceError } from "./services/guest-session-service";
import { HotelOnboardingServiceError } from "./services/hotel-onboarding-service";
import { MenuServiceError } from "./services/menu-service";
import { OrderServiceError } from "./services/order-service";
import { RoomAdminServiceError } from "./services/room-admin-service";

export type UserFacingAudience = "guest" | "staff";

export interface UserFacingErrorMessage {
	code: string;
	message: string;
	retryable: boolean;
	title: string;
}

function getErrorCode(error: unknown) {
	if (
		error instanceof CatalogAdminServiceError ||
		error instanceof GuestSessionServiceError ||
		error instanceof HotelOnboardingServiceError ||
		error instanceof MenuServiceError ||
		error instanceof OrderServiceError ||
		error instanceof RoomAdminServiceError
	) {
		return error.code;
	}

	if (
		typeof error === "object" &&
		error !== null &&
		"code" in error &&
		typeof error.code === "string"
	) {
		return error.code;
	}

	return "INTERNAL_ERROR";
}

export function mapDomainErrorToUserMessage(
	error: unknown,
	audience: UserFacingAudience,
): UserFacingErrorMessage {
	const code = getErrorCode(error);

	switch (code) {
		case "GUEST_SESSION_EXPIRED":
			return {
				code,
				message:
					"Sua sessão expirou. Escaneie o QR do quarto novamente para continuar.",
				retryable: true,
				title: "Sessão expirada",
			};
		case "GUEST_SESSION_NOT_FOUND":
			return {
				code,
				message:
					"O link da sessão é inválido ou não está mais disponível. Abra o QR do quarto novamente.",
				retryable: true,
				title: "Sessão inválida",
			};
		case "ROOM_TOKEN_NOT_FOUND":
			return {
				code,
				message:
					"Não encontramos esse QR code. Tente escanear novamente o código do quarto.",
				retryable: true,
				title: "QR inválido",
			};
		case "HOTEL_INACTIVE":
		case "ROOM_INACTIVE":
			return {
				code,
				message:
					audience === "guest"
						? "Este atendimento não está disponível no momento. Fale com a recepção se precisar de ajuda."
						: "O hotel ou quarto vinculado a esta operação está inativo.",
				retryable: false,
				title: "Atendimento indisponível",
			};
		case "MENU_ITEM_UNAVAILABLE":
			return {
				code,
				message:
					audience === "guest"
						? "Um dos itens escolhidos ficou indisponível. Revise o pedido e tente novamente."
						: "O item selecionado não está disponível para este hotel ou pedido.",
				retryable: true,
				title: "Item indisponível",
			};
		case "MENU_ITEM_NOT_FOUND":
			return {
				code,
				message:
					audience === "guest"
						? "Não encontramos um dos itens do pedido. Atualize o cardápio e tente novamente."
						: "O item solicitado não foi encontrado no catálogo deste hotel.",
				retryable: true,
				title: "Item não encontrado",
			};
		case "ORDER_NOT_FOUND":
			return {
				code,
				message:
					audience === "guest"
						? "Não encontramos esse pedido na sua sessão atual."
						: "O pedido solicitado não foi encontrado para o seu hotel.",
				retryable: false,
				title: "Pedido não encontrado",
			};
		case "ORDER_TRANSITION_INVALID":
			return {
				code,
				message:
					"Essa mudança de status não é permitida no momento. Atualize a fila e tente novamente.",
				retryable: true,
				title: "Transição inválida",
			};
		case "STAFF_MEMBERSHIP_REQUIRED":
			return {
				code,
				message:
					"Sua conta está autenticada, mas ainda não possui acesso a um hotel válido.",
				retryable: false,
				title: "Acesso indisponível",
			};
		case "ALREADY_HAS_HOTEL":
			return {
				code,
				message:
					"Sua conta jÃ¡ possui um hotel vinculado. Vamos abrir o painel existente.",
				retryable: false,
				title: "Hotel jÃ¡ configurado",
			};
		case "INVALID_HOTEL_ONBOARDING":
			return {
				code,
				message:
					"Revise os dados obrigatÃ³rios do hotel antes de concluir o cadastro inicial.",
				retryable: true,
				title: "Cadastro incompleto",
			};
		case "SLUG_CONFLICT":
			return {
				code,
				message:
					"Esse identificador do hotel jÃ¡ estÃ¡ em uso. Escolha outro slug para continuar.",
				retryable: true,
				title: "Slug indisponÃ­vel",
			};
		case "UNAUTHORIZED_ROLE":
			return {
				code,
				message:
					"Só administradores e gerentes podem gerenciar recursos administrativos deste hotel.",
				retryable: false,
				title: "Permissão insuficiente",
			};
		case "ROOM_LABEL_CONFLICT":
			return {
				code,
				message: "Já existe um quarto com esse nome neste hotel.",
				retryable: true,
				title: "Quarto duplicado",
			};
		case "ROOM_NOT_FOUND":
			return {
				code,
				message:
					"O quarto solicitado não foi encontrado ou não pertence ao seu hotel.",
				retryable: false,
				title: "Quarto não encontrado",
			};
		case "TENANT_MISMATCH":
			return {
				code,
				message:
					audience === "guest"
						? "Esse conteúdo não pertence à sua sessão atual."
						: "Você tentou acessar um recurso de outro hotel.",
				retryable: false,
				title: "Acesso negado",
			};
		case "INVALID_PRICE":
			return {
				code,
				message:
					"O preço informado é inválido. Revise o valor e tente novamente.",
				retryable: true,
				title: "Preço inválido",
			};
		case "CATEGORY_NOT_FOUND":
		case "ITEM_NOT_FOUND":
			return {
				code,
				message:
					"O recurso solicitado não foi encontrado ou não pertence ao seu hotel.",
				retryable: false,
				title: "Recurso não encontrado",
			};
		default:
			return {
				code: "INTERNAL_ERROR",
				message:
					audience === "guest"
						? "Não foi possível concluir sua solicitação agora. Tente novamente em instantes."
						: "Ocorreu um erro inesperado ao processar esta operação.",
				retryable: true,
				title: "Erro inesperado",
			};
	}
}
