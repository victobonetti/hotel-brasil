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
				"Sua conta esta autenticada, mas ainda nao foi vinculada a um hotel. Peca para um admin criar sua associacao de staff.",
			title: "Aguardando vinculacao a um hotel",
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
