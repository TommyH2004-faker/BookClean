import { endpointBE } from "../layouts/utils/Constant";
import {my_request} from "./Request";
import OrderModel from "../models/OrderModel";
import CartItemModel from "../models/CartItemModel";
import { PriceChange } from "@mui/icons-material";






export async function getAllOrders(): Promise<OrderModel[]> {
   try {
      const endpoint: string = endpointBE + "/order/all?sort=id_desc&size=100";

      const response = await my_request(endpoint);

      if (!response?.data) return [];

      return response.data.map((data: any) => ({
         idOrder: data.id,
         deliveryAddress: data.deliveryAddress,
         totalPrice: data.totalPrice ?? 0,
         totalPriceProduct: data.totalPriceProduct ?? 0,
         feeDelivery: data.feeDelivery ?? 0,
         feePayment: data.feePayment ?? 0,
         dateCreated: data.dateCreated,
         status: data.status,
         fullName: data.fullName,
         note: data.note ?? "",

         user: {
            id: data.userId,
            fullName: data.userName ?? ""
         },

         payment: data.paymentName ?? "",
         delivery: data.deliveryName ?? "",

         // 🔥 QUAN TRỌNG: map items
         items: (data.items ?? []).map((item: any) => ({
            bookId: item.bookId,
            bookName: item.bookName,
            quantity: item.quantity,
            price: item.price
         }))
      }));

   } catch (error) {
      console.error("Error while fetching orders:", error);
      return []; 
   }
}

export async function getMyOrders(): Promise<OrderModel[]> {
   const token = localStorage.getItem("token");

   const response = await fetch(endpointBE + `/order/my-orders`, {
      method: "GET",
      headers: {
         "Content-Type": "application/json",
         Authorization: `Bearer ${token}`,
      },
   });

   if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
   }

   const res = await response.json();

   const datas = res.data;

   const orders: OrderModel[] = datas.map((data: any) => {
      return {
         idOrder: data.id,
         deliveryAddress: data.deliveryAddress,

         totalPriceProduct: data.totalPriceProduct,
         feeDelivery: data.feeDelivery ?? 0,
         feePayment: data.feePayment ?? 0,

         totalPrice:
            data.totalPriceProduct +
            (data.feeDelivery ?? 0) +
            (data.feePayment ?? 0),

         dateCreated: new Date(data.dateCreated),
         status: data.status,

         fullName: data.fullName,
         phoneNumber: data.phoneNumber ?? "",
         note: data.note,

         payment: data.paymentName,

         cartItems: data.items.map((item: any) => ({
            quantity: item.quantity,
            book: {
               idBook: item.bookId,
               nameBook: item.bookName,
               sellPrice: item.sellPrice,
               listPrice: item.listPrice,
            },
         })),
      };
   });

   return orders;
}

export async function get1Orders(idOrder: number): Promise<OrderModel> {
   const endpoint = endpointBE + `/order/${idOrder}`;

   const res = await my_request(endpoint);

   const data = res.data;

   // const cartItems: CartItemModel[] = data.items?.map((item: any) => {
   //    return new CartItemModel(
   //       item.quantity,
   //       {
   //          price: item.price,
   //          idBook: item.bookId,
   //          nameBook: item.bookName,
   //           sellPrice: item.sellPrice,  
   //          listPrice: item.listPrice
   //       } as any, // nếu BookModel chưa full
   //    );
   // });
   const cartItems: CartItemModel[] = data.items?.map((item: any) => {
   const cartItem = new CartItemModel(
      item.quantity,
      {
         idBook: item.bookId,
         nameBook: item.bookName,
         sellPrice: item.sellPrice,
         listPrice: item.listPrice
      } as any
   );

   cartItem.price = item.price; // ✅ GÁN ĐÚNG CHỖ

   return cartItem;
});

   const order: OrderModel = {
      idOrder: data.id,
      deliveryAddress: data.deliveryAddress,

      totalPriceProduct: data.totalPriceProduct,
      feeDelivery: data.feeDelivery ?? 0,
      feePayment: data.feePayment ?? 0,

      // 👉 fix totalPrice luôn
      totalPrice:
         data.totalPriceProduct +
         (data.feeDelivery ?? 0) +
         (data.feePayment ?? 0),

      dateCreated: new Date(data.dateCreated),
      status: data.status,

      fullName: data.fullName,
      phoneNumber: data.phoneNumber ?? "",
      note: data.note,

      payment: data.paymentName,

      cartItems: cartItems,
   };

   return order;
}