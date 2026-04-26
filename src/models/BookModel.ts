import GenreModel from "./GenreModel";
import ImageModel from "./ImageModel";

class BookModel {
   id?: number;
   idBook: number; // id sach
   nameBook?: string; // Có thể NULL
   author?: string; // tac gia
   isbn?: string; // ma isbn
   description?: string; // mo ta
   listPrice: number; // gia goc
   sellPrice: number; // gia ban
   isFlashSale?: boolean; // đang flash sale
   flashSalePrice?: number | null; // giá flash sale (nếu có)
   quantity?: number; // so luong
   avgRating?: number; // diem trung binh
   soldQuantity?: number; // so luong da ban
   discountPercent?: number; // phan tram giam gia
   thumbnail?: string; // anh bia
   relatedImg?: string[]; // anh lien quan
   idGenres?: number[]; // id the loai
   genresList?: GenreModel[]; // danh sach the loai
   isFavorited?: boolean; // da yeu thich
   images?: ImageModel[]; // danh sach hinh anh
   price?: number; // gia sau giam gia

   constructor(idBook: number, nameBook: string, author: string, isbn: string, description: string, listPrice: number, sellPrice: number, quantity: number, avgRating: number, soldQuantity: number, discountPercent: number, thumbnail: string , price ?: number) {
      this.idBook = idBook;
      this.nameBook = nameBook;
      this.author = author;
      this.isbn = isbn;
      this.description = description;
      this.listPrice = listPrice;
      this.sellPrice = sellPrice;
      this.quantity = quantity;
      this.avgRating = avgRating;
      this.soldQuantity = soldQuantity;
      this.discountPercent = discountPercent;
      this.thumbnail = thumbnail;
      this.price = price;
   }
}

export default BookModel;