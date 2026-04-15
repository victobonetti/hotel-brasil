export function belongsToHotel(
	resourceHotelId: string | null | undefined,
	actorHotelId: string | null | undefined,
) {
	return Boolean(resourceHotelId && actorHotelId && resourceHotelId === actorHotelId);
}
