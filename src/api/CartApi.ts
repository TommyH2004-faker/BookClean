import { endpointBE } from "../layouts/utils/Constant";
import { getFlashSaleMaxPerUser, getPurchasedFlashSaleQuantityForBook } from "../layouts/utils/flashSaleLimit";
import CartItemModel from "../models/CartItemModel";



// export async function getCartAllByIdUser(): Promise<CartItemModel[]> {
//    const idUser = getIdUserByToken();
//    // const endpoint = `${endpointBE}/users/${idUser}/listCartItems`;
//    const endpoint = `${endpointBE}/cart-items`;
//    try {
//       const cartResponse = await my_request(endpoint);
//       if (cartResponse) {
//          const cartsResponseList: CartItemModel[] = await Promise.all(cartResponse.map(async (item: any) => {
//             const bookResponse = await getBookByIdCartItem(item.idCart);
//             return { ...item, book: bookResponse };
//          }));
//          return cartsResponseList;
//       }
//    } catch (error) {
//       console.error('Error: ', error);
//    }
//    return [];
// }
export async function getCartAllByIdUser(): Promise<CartItemModel[]> {
    const endpoint = `${endpointBE}/cart-items/my-cart`;

    try {
        const token = localStorage.getItem("token");

        const response = await fetch(endpoint, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
        });

        if (!response.ok) {
            throw new Error("Không thể truy cập đường dẫn");
        }

        const cartResponse = await response.json();

        return await Promise.all(cartResponse.map(async (item: any) => {
			const isFlashSale = Boolean(item.book?.isFlashSale);
			const flashSalePrice = typeof item.book?.flashSalePrice === "number" ? item.book.flashSalePrice : null;
            const normalSellPrice = item.book?.sellPrice ?? 0;
            let effectiveSellPrice = isFlashSale && typeof flashSalePrice === "number" && flashSalePrice > 0
                ? flashSalePrice
                : normalSellPrice;
            let effectiveIsFlashSale = isFlashSale;

            if (isFlashSale) {
                const bookId = Number(item.book?.id ?? item.book?.idBook ?? 0);
                const maxPerUser = await getFlashSaleMaxPerUser(bookId);
                if (maxPerUser) {
                    const purchasedQuantity = await getPurchasedFlashSaleQuantityForBook(bookId);
                    if (purchasedQuantity >= maxPerUser) {
                        effectiveSellPrice = normalSellPrice;
                        effectiveIsFlashSale = false;
                    }
                }
            }

			return {
            idCart: item.idCart ?? item.id,
            quantity: item.quantity,
            book: {
                id: item.book?.id ?? 0,
                idBook: item.book?.id ?? 0,
                nameBook: item.book?.name ?? "",
                sellPrice: effectiveSellPrice,
                listPrice: item.book?.listPrice ?? 0,
                isFlashSale: effectiveIsFlashSale,
                flashSalePrice,
                quantity: item.book?.quantity ?? 0,
                soldQuantity: item.book?.soldQuantity ?? 0,
            },
			};
        }));
    } catch (error) {
        console.error("Error: ", error);
        return [];
    }
}

export async function deleteCartItemById(idCart: number): Promise<void> {
    const endpoint = `${endpointBE}/cart-items/${idCart}`;
    const token = localStorage.getItem("token");

    if (!token) {
        throw new Error("Chưa đăng nhập (thiếu token)");
    }

    const response = await fetch(endpoint, {
        method: "DELETE",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
    });

    if (!response.ok) {
        throw new Error(`Xoá cart-item thất bại (status: ${response.status})`);
    }
}

export async function clearMyCart(cartList: CartItemModel[]): Promise<void> {
    const ids: number[] = cartList
        .map((item) => item.idCart)
        .filter((idCart): idCart is number => typeof idCart === "number");

    await Promise.all(
        ids.map(async (idCart) => {
            try {
                await deleteCartItemById(idCart);
            } catch (error) {
                console.error("Không xoá được cart-item:", idCart, error);
            }
        })
    );
}
// CartApi.ts
// export async function clearMyCart(ids: number[]): Promise<void> {
//     await Promise.all(
//         ids.map(async (idCart) => {
//             try {
//                 await deleteCartItemById(idCart);
//             } catch (error) {
//                 console.error("Không xoá được cart-item:", idCart, error);
//             }
//         })
//     );
// }