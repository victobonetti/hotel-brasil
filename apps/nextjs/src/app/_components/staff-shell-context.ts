import { getStaffAccessContext } from "./staff-access-context";

export interface StaffShellContext {
	hotelName: string;
	role: "admin" | "frontdesk" | "kitchen" | "manager";
	userName: string;
}

export async function getStaffShellContext(): Promise<StaffShellContext | null> {
	const access = await getStaffAccessContext();

	if (!access.session || !access.membership || !access.userName) {
		return null;
	}

	return {
		hotelName: access.membership.hotelName,
		role: access.membership.role,
		userName: access.userName,
	};
}
