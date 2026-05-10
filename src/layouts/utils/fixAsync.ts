import BookModel from "../../models/BookModel";

export const getDisplayPrice = (book: BookModel) => {
    const flashPrice =
        (book as any).flashSalePrice;

    return book.isFlashSale && typeof flashPrice === "number" && flashPrice > 0
        ? flashPrice
        : book.sellPrice;
};