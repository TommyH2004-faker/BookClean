import React, { createContext, useContext, useEffect, useState } from "react";
import CartItemModel from "../../models/CartItemModel";
import { isToken } from "./JwtService";
import { getCartAllByIdUser } from "../../api/CartApi";


interface CartItemProps {
	children: React.ReactNode;
}

interface CartItemType {
	cartList: CartItemModel[];
	setCartList: any;
	totalCart: number;
	setTotalCart: any;
}

const CartItem = createContext<CartItemType | undefined>(undefined);

export const CartItemProvider: React.FC<CartItemProps> = (props) => {
	const [cartList, setCartList] = useState<CartItemModel[]>([]);
	const [totalCart, setTotalCart] = useState(0);

	useEffect(() => {
		let cancelled = false;

		const loadCart = async () => {
			if (isToken()) {
				try {
					const carts = await getCartAllByIdUser();
					if (cancelled) return;
					setCartList(carts);
					setTotalCart(carts.length);
					localStorage.setItem("cart", JSON.stringify(carts));
					return;
				} catch {
					// fallback to localStorage
				}
			}

			const cartData: string | null = localStorage.getItem("cart");
			const cart: CartItemModel[] = cartData ? JSON.parse(cartData) : [];
			if (cancelled) return;
			setCartList(cart);
			setTotalCart(cart.length);
		};

		void loadCart();
		return () => {
			cancelled = true;
		};
	}, []);

	return (
		<CartItem.Provider
			value={{ cartList, setCartList, totalCart, setTotalCart }}
		>
			{props.children}
		</CartItem.Provider>
	);
};

export const useCartItem = (): CartItemType => {
	const context = useContext(CartItem);
	if (!context) {
		throw new Error("Lỗi context");
	}
	return context;
};
