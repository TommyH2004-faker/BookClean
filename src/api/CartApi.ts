
import { endpointBE } from "../layouts/utils/Constant";
import { getIdUserByToken } from "../layouts/utils/JwtService";
import CartItemModel from "../models/CartItemModel";


import { my_request } from "./Request";
import { getBookByIdCartItem } from "./SachAPI";


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

        return cartResponse.map((item: any) => ({
            idCart: item.idCart ?? item.id,
            quantity: item.quantity,
            book: {
                id: item.book?.id ?? 0,
                idBook: item.book?.id ?? 0,
                nameBook: item.book?.name ?? "",
                sellPrice: item.book?.sellPrice ?? 0,
                listPrice: item.book?.listPrice ?? 0,
                quantity: item.book?.quantity ?? 0,
                soldQuantity: item.book?.soldQuantity ?? 0,
            },
        }));
    } catch (error) {
        console.error("Error: ", error);
        return [];
    }
}