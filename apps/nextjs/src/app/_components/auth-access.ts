export interface StaffMembershipSummary {
	hotelName: string;
	role: "admin" | "frontdesk" | "kitchen" | "manager";
}

export function getStaffAccessSummary(
	membership: StaffMembershipSummary | null,
) {
	if (!membership) {
		return {
			canAccessCatalog: false,
			canAccessOrders: false,
			description:
				"Sua conta esta pronta para iniciar. Conclua o cadastro do hotel para liberar o painel e configurar a operacao.",
			title: "Concluir setup do hotel",
		};
	}

	const canAccessCatalog =
		membership.role === "admin" || membership.role === "manager";

	return {
		canAccessCatalog,
		canAccessOrders: true,
		description: canAccessCatalog
			? `Voce faz parte do hotel ${membership.hotelName} como ${membership.role} e pode operar pedidos e administrar o catalogo.`
			: `Voce faz parte do hotel ${membership.hotelName} como ${membership.role} e pode operar pedidos ativos desse hotel.`,
		title: `Acesso liberado para ${membership.hotelName}`,
	};
}
