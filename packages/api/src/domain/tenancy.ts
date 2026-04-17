export interface TenantScope {
	guestSessionId?: string;
	hotelId: string;
	roomId?: string;
	userId?: string;
}

export function belongsToHotel(
	resourceHotelId: string | null | undefined,
	actorHotelId: string | null | undefined,
) {
	return Boolean(
		resourceHotelId && actorHotelId && resourceHotelId === actorHotelId,
	);
}

export function createTenantScope(scope: TenantScope) {
	return scope;
}

export function assertResourceBelongsToTenant(
	resourceHotelId: string | null | undefined,
	scope: TenantScope,
	resourceName = "Resource",
) {
	if (!belongsToHotel(resourceHotelId, scope.hotelId)) {
		throw new Error(
			`${resourceName} does not belong to hotel ${scope.hotelId}`,
		);
	}

	return resourceHotelId;
}
