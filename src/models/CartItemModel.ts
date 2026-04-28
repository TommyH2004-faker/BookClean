import BookModel from "./BookModel";

class CartItemModel {
   id?: number;
   idCart?: any; // id san pham trong gio hang
   quantity: number; // so luong
   book: BookModel; // sach
   idUser?: number; // id nguoi dung
   review?: boolean; // da review chua
   price?: number; // gia ban tai thoi diem them vao gio hang
   totalItemPrice!: number; // tong gia tien cua item (quantity * price tai thoi diem them vao gio hang)
   totalQuantity!: number; // tong so luong da mua cua san pham (bao gom ca flash sale va binh thuong)  
   saleQuantity!: number;
    normalQuantity!: number;
    flashSalePrice!: number | null;
    normalPrice!: number;

   constructor(quantity: number, book: BookModel) {
      this.quantity = quantity;
      this.book = book;
    
   }
}

export default CartItemModel;