import { endpointBE } from "../layouts/utils/Constant";
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
// export async function getCartAllByIdUser(): Promise<CartItemModel[]> {
//     const endpoint = `${endpointBE}/cart-items/my-cart`;

//     try {
//         const token = localStorage.getItem("token");

//         const response = await fetch(endpoint, {
//             method: "GET",
//             headers: {
//                 "Content-Type": "application/json",
//                 Authorization: `Bearer ${token}`,
//             },
//         });

//         if (!response.ok) {
//             throw new Error("Không thể truy cập đường dẫn");
//         }

//         const cartResponse = await response.json();

//         return await Promise.all(cartResponse.map(async (item: any) => {
// 			const isFlashSale = Boolean(item.book?.isFlashSale);
// 			const flashSalePrice = typeof item.book?.flashSalePrice === "number" ? item.book.flashSalePrice : null;
//             const normalSellPrice = item.book?.sellPrice ?? 0;
//             let effectiveSellPrice = isFlashSale && typeof flashSalePrice === "number" && flashSalePrice > 0
//                 ? flashSalePrice
//                 : normalSellPrice;
//             let effectiveIsFlashSale = isFlashSale;

//             if (isFlashSale) {
//                 const bookId = Number(item.book?.id ?? item.book?.idBook ?? 0);
//                 const maxPerUser = await getFlashSaleMaxPerUser(bookId);
//                 if (maxPerUser) {
//                     const purchasedQuantity = await getPurchasedFlashSaleQuantityForBook(bookId);
//                     if (purchasedQuantity >= maxPerUser) {
//                         effectiveSellPrice = normalSellPrice;
//                         effectiveIsFlashSale = false;
//                     }
//                 }
//             }

// 			return {
//             idCart: item.idCart ?? item.id,
//             quantity: item.quantity,
//             book: {
//                 id: item.book?.id ?? 0,
//                 idBook: item.book?.id ?? 0,
//                 nameBook: item.book?.name ?? "",
//                 sellPrice: effectiveSellPrice,
//                 listPrice: item.book?.listPrice ?? 0,
//                 isFlashSale: effectiveIsFlashSale,
//                 flashSalePrice,
//                 quantity: item.book?.quantity ?? 0,
//                 soldQuantity: item.book?.soldQuantity ?? 0,
//             },
// 			};
//         }));
//     } catch (error) {
//         console.error("Error: ", error);
//         return [];
//     }
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

        // Lưu lại các field BE đã tính (sale/normal split + tổng tiền)
        return cartResponse.map((item: any) => {
            const idCart = item.idCart ?? item.IdCart ?? item.id ?? item.Id;
            const quantity = item.quantity ?? item.Quantity ?? 0;

            const bookId =
                item.book?.idBook ?? item.book?.IdBook ??
                item.book?.id ?? item.book?.Id ??
                0;
            const bookName =
                item.book?.nameBook ?? item.book?.NameBook ??
                item.book?.name ?? item.book?.Name ??
                "";
            const bookStock =
                item.book?.availableQuantity ?? item.book?.AvailableQuantity ??
                item.book?.quantity ?? item.book?.Quantity ??
                0;

            return {
                idCart,
                quantity,
				totalQuantity: item.totalQuantity ?? item.TotalQuantity,
				saleQuantity: item.saleQuantity ?? item.SaleQuantity,
				normalQuantity: item.normalQuantity ?? item.NormalQuantity,
                flashSalePrice:
                    item.flashSalePrice ?? item.FlashSalePrice ??
                    item.book?.flashSalePrice ?? item.book?.FlashSalePrice ??
                    null,
                normalPrice:
                    item.normalPrice ?? item.NormalPrice ??
                    item.book?.sellPrice ?? item.book?.SellPrice,
				totalItemPrice: item.totalItemPrice ?? item.TotalItemPrice,
				flashSaleItemId: item.flashSaleItemId ?? item.FlashSaleItemId ?? null,

                book: {
                    id: bookId,
                    idBook: bookId,
                    nameBook: bookName,
                    // Lấy luôn giá trị backend đã tính toán sẵn
                    sellPrice: item.book?.sellPrice ?? item.book?.SellPrice ?? 0,
                    listPrice: item.book?.listPrice ?? item.book?.ListPrice ?? 0,
                    isFlashSale: item.book?.isFlashSale ?? item.book?.IsFlashSale ?? false,
                    flashSalePrice: item.book?.flashSalePrice ?? item.book?.FlashSalePrice ?? null,
                    quantity: bookStock,
                    soldQuantity: item.book?.soldQuantity ?? item.book?.SoldQuantity ?? 0,
                },
            };
        });
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