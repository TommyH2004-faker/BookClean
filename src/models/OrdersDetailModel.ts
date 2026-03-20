import BookModel from "./BookModel";

class OrdersDetailModel {
    idOrdersDetail?: number;
    book: BookModel;
    quantity: number;
    price: number;

    constructor(book: BookModel, quantity: number, price: number) {
        this.book = book;
        this.quantity = quantity;
        this.price = price;
    }
}

export default OrdersDetailModel;
