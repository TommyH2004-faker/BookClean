import BookModel from "./BookModel";

class CartItemModel {
   id?: number;
   idCart?: any; // id san pham trong gio hang
   quantity: number; // so luong
   book: BookModel; // sach
   idUser?: number; // id nguoi dung
   review?: boolean; // da review chua

   constructor(quantity: number, book: BookModel) {
      this.quantity = quantity;
      this.book = book;
   }
}

export default CartItemModel;