class OrderItemModel {
  bookId: number;
  bookName: string;
  quantity: number;
  price: number;        // 👈 QUAN TRỌNG
  sellPrice: number;
  listPrice: number;

  constructor(
    bookId: number,
    bookName: string,
    quantity: number,
    price: number,
    sellPrice: number,
    listPrice: number
  ) {
    this.bookId = bookId;
    this.bookName = bookName;
    this.quantity = quantity;
    this.price = price;
    this.sellPrice = sellPrice;
    this.listPrice = listPrice;
  }
}

export default OrderItemModel;