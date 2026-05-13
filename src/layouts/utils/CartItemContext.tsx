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

const normalizeCartItem = (item: CartItemModel): CartItemModel => {
	const quantity =
		item.totalQuantity ??
		item.quantity ??
		((item.saleQuantity ?? 0) + (item.normalQuantity ?? 0));

	const normalPrice =
		item.normalPrice ??
		item.book?.sellPrice ??
		0;

	const flashSalePrice =
		item.flashSalePrice ??
		item.book?.flashSalePrice ??
		null;

	const saleQuantity =
		item.saleQuantity ??
		(flashSalePrice != null ? quantity : 0);

	const normalQuantity =
		item.normalQuantity ??
		Math.max(0, quantity - saleQuantity);

	return {
		...item,
		quantity,
		totalQuantity: quantity,
		saleQuantity,
		normalQuantity,
		normalPrice,
		flashSalePrice,
		totalItemPrice:
			item.totalItemPrice ??
			((saleQuantity * (flashSalePrice ?? 0)) + (normalQuantity * normalPrice)),
	};
};

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
						const normalizedCarts = carts.map(normalizeCartItem);
						setCartList(normalizedCarts);
						setTotalCart(normalizedCarts.reduce((sum, item) => sum + (item.quantity ?? 0), 0));
						localStorage.setItem("cart", JSON.stringify(normalizedCarts));
					return;
				} catch {
					// fallback to localStorage
				}
			}

			const cartData: string | null = localStorage.getItem("cart");
				const cart: CartItemModel[] = cartData ? JSON.parse(cartData) : [];
				const normalizedCart = cart.map(normalizeCartItem);
			if (cancelled) return;
				setCartList(normalizedCart);
				setTotalCart(normalizedCart.reduce((sum, item) => sum + (item.quantity ?? 0), 0));
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
