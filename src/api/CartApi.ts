
import { getIdUserByToken } from "../layouts/utils/JwtService";
import CartItemModel from "../models/CartItemModel";
import {my_request} from "./Request";
import {getBookByIdCartItem} from "./SachAPI";


export async function getCartAllByIdUser(): Promise<CartItemModel[]> {
   const idUser = getIdUserByToken();
   const endpoint = "http://localhost:8080" + `/users/${idUser}/listCartItems`;
   try {
      const cartResponse = await my_request(endpoint);
      if (cartResponse) {
         const cartsResponseList: CartItemModel[] = await Promise.all(cartResponse._embedded.cartItems.map(async (item: any) => {
            const bookResponse = await getBookByIdCartItem(item.idCart);
            return { ...item, book: bookResponse };
         }));
         return cartsResponseList;
      }
   } catch (error) {
      console.error('Error: ', error);
   }
   return [];
}