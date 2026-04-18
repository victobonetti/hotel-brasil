import { describe, expect, test } from "bun:test";

import { getStaffNavItems, isStaffNavItemActive } from "./staff-nav";

describe("getStaffNavItems", () => {
	test("lists the main staff destinations", () => {
		expect(getStaffNavItems()).toEqual([
			{
				description: "Fila e andamento",
				href: "/staff/orders",
				label: "Pedidos",
			},
			{
				description: "Categorias e itens",
				href: "/staff/menu",
				label: "Cardapio",
			},
			{
				description: "Quartos e acesso",
				href: "/staff/rooms",
				label: "Quartos",
			},
		]);
	});
});

describe("isStaffNavItemActive", () => {
	test("marks menu routes as active for nested menu pages", () => {
		expect(isStaffNavItemActive("/staff/menu", "/staff/menu")).toBe(true);
		expect(isStaffNavItemActive("/staff/menu/items", "/staff/menu")).toBe(true);
		expect(isStaffNavItemActive("/staff/orders", "/staff/menu")).toBe(false);
	});

	test("marks rooms route as active only for the rooms page", () => {
		expect(isStaffNavItemActive("/staff/rooms", "/staff/rooms")).toBe(true);
		expect(isStaffNavItemActive("/staff/orders", "/staff/rooms")).toBe(false);
	});
});
