import { hotels, staffUserHotels } from "@nowait24/db/schema";
import type { TRPCRouterRecord } from "@trpc/server";
import { TRPCError } from "@trpc/server";
import { z } from "zod/v4";
import { mapDomainErrorToUserMessage } from "../errors";
import {
	createInitialHotel,
	getHotelOnboardingStatus,
	HotelOnboardingServiceError,
} from "../services/hotel-onboarding-service";
import { protectedProcedure } from "../trpc";
import { findStaffMembershipWithHotelByUserId } from "./staff-membership";

function mapHotelOnboardingError(error: unknown): never {
	if (error instanceof HotelOnboardingServiceError) {
		const userMessage = mapDomainErrorToUserMessage(error, "staff");

		if (error.code === "ALREADY_HAS_HOTEL" || error.code === "SLUG_CONFLICT") {
			throw new TRPCError({ code: "CONFLICT", message: userMessage.message });
		}

		if (error.code === "INVALID_HOTEL_ONBOARDING") {
			throw new TRPCError({
				code: "BAD_REQUEST",
				message: userMessage.message,
			});
		}
	}

	const fallback = mapDomainErrorToUserMessage(error, "staff");
	throw new TRPCError({
		code: "INTERNAL_SERVER_ERROR",
		message: fallback.message,
	});
}

const hotelOnboardingInput = z.object({
	addressLine: z.string().min(1),
	city: z.string().min(1),
	country: z.string().min(1),
	currency: z.string().min(1),
	email: z.string().min(1),
	hotelName: z.string().min(1),
	phone: z.string().min(1),
	slug: z.string().min(1),
	state: z.string().min(1),
	timezone: z.string().min(1),
});

export const staffOnboardingRouter = {
	createInitialHotel: protectedProcedure
		.input(hotelOnboardingInput)
		.mutation(async ({ ctx, input }) => {
			try {
				return await createInitialHotel(
					{
						createHotelAndMembership: async ({ hotel, membership }) => {
							await ctx.db.transaction(async (tx) => {
								await tx.insert(hotels).values(hotel);
								await tx.insert(staffUserHotels).values(membership);
							});
						},
						findHotelBySlug: async (slug) =>
							(await ctx.db.query.hotels.findFirst({
								columns: { id: true },
								where: (table, operators) => operators.eq(table.slug, slug),
							})) ?? null,
						findMembershipByUserId: async (userId) =>
							(await ctx.db.query.staffUserHotels.findFirst({
								columns: { hotelId: true },
								where: (table, operators) => operators.eq(table.userId, userId),
							})) ?? null,
					},
					{
						...input,
						userId: ctx.session.user.id,
					},
				);
			} catch (error) {
				mapHotelOnboardingError(error);
			}
		}),
	getOnboardingStatus: protectedProcedure.query(async ({ ctx }) => {
		try {
			return await getHotelOnboardingStatus(
				{
					findMembershipByUserId: async (userId) =>
						await findStaffMembershipWithHotelByUserId(ctx.db, userId),
				},
				{
					userId: ctx.session.user.id,
				},
			);
		} catch (error) {
			mapHotelOnboardingError(error);
		}
	}),
} satisfies TRPCRouterRecord;
